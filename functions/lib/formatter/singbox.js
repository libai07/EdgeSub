function buildTLS(q, server, isReality = false) {
  const tls = {
    enabled: true,
    server_name: q.sni || server,
    insecure: q.insecure === "1" || q.allowInsecure === "1",
    utls: { enabled: true, fingerprint: q.fp || "chrome" },
  };

  if (isReality) {
    tls.reality = { enabled: true, public_key: q.pbk };
    if (q.sid) tls.reality.short_id = q.sid;
  }

  return tls;
}

function buildTransport(q, network) {
  const transport = { type: network };
  const path = q.path || "/";
  const host = q.host || "";

  switch (network) {
    case "ws":
      transport.path = path;
      if (host) transport.headers = { Host: host };
      if (q.maxEarlyData) transport.max_early_data = parseInt(q.maxEarlyData);
      if (q.earlyDataHeaderName) transport.early_data_header_name = q.earlyDataHeaderName;
      break;
    case "httpupgrade":
    case "h2":
    case "http":
      transport.path = path;
      if (host) transport.host = host.split(",").map(h => h.trim());
      break;
    case "grpc":
      transport.service_name = path;
      break;
  }
  return transport;
}

function nodeToSingbox(node) {
  try {
    const url = new URL(node._raw);
    const tag = node.name;
    const server = url.hostname;
    const serverPort = parseInt(url.port) || 443;
    const q = Object.fromEntries(url.searchParams);
    const auth = url.username ? decodeURIComponent(url.username) : "";

    switch (node.type) {
      case "vless": {
        const flow = q.flow || "xtls-rprx-vision";
        const network = q.type || "tcp";
        const security = q.security || "tls";
        const isReality = security === "reality";
        const isXhttp = network === "xhttp";

        if (network === "xhttp") return null;

        const ob = {
          type: "vless", tag, server,
          server_port: serverPort,
          uuid: auth,
          flow: network === "tcp" && (security === "tls" || security === "reality") ? q.flow || "xtls-rprx-vision" : undefined,
          tls: buildTLS(q, server, security === "reality"),
        };

        if (["ws", "grpc"].includes(network)) {
          ob.transport = buildTransport(q, network);
        }

        return ob;
      }
      case "hysteria2": {
        const tls = {
          enabled: true,
          server_name: q.sni || server,
          insecure: q.insecure === "1",
          alpn: ["h3"],
        };
        const obfs = q.obfs === "salamander" && q["obfs-password"]
          ? { type: "salamander", password: q["obfs-password"] }
          : undefined;
        const ob = {
          type: "hysteria2", tag, server,
          server_port: serverPort,
          password: auth,
          tls,
          obfs,
        };
        const upMbps = parseInt(q.up_mbps || q.up);
        const downMbps = parseInt(q.down_mbps || q.down);
        if (upMbps > 0) ob.up_mbps = upMbps;
        if (downMbps > 0) ob.down_mbps = downMbps;
        if (q.ports) ob.ports = q.ports;
        if (q.port) ob.ports = q.port;
        return ob;
      }
      case "anytls": {
        const ob = {
          type: "anytls", tag, server,
          server_port: serverPort, password: auth,
        };
        const isReality = q.pbk !== undefined;
        if (isReality) {
          const reality = { enabled: true, public_key: q.pbk };
          if (q.sid) reality.short_id = q.sid;
          ob.tls = {
            enabled: true,
            server_name: q.sni || server,
            utls: { enabled: true, fingerprint: q.fp || "chrome" },
            reality,
          };
        } else {
          ob.tls = buildTLS(q, server);
        }
        return ob;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function toSingBoxJson(nodes, env = {}) {
  const validNodes = nodes.filter(n => nodeToSingbox(n) !== null);
  const nodeNames = validNodes.map(n => n.name);

  // 地区分组
  const regionMap = new Map();
  for (const n of validNodes) {
    const regionName = n._region?.name || "其他";
    if (!regionMap.has(regionName)) regionMap.set(regionName, []);
    regionMap.get(regionName).push(n.name);
  }

  // 0. 直连
  const outbounds = [{ type: "direct", tag: "direct" }];

  // 1. 总控层 - 节点选择
  outbounds.push({
    type: "selector",
    tag: "🔰 节点选择",
    outbounds: ["🔮 故障转移", ...nodeNames, "direct"],
    default: "🔮 故障转移",
  });

  // 2. 策略层 - 故障转移
  outbounds.push({
    type: "fallback",
    tag: "🔮 故障转移",
    outbounds: [nodeNames[0] || "direct", nodeNames[1] || nodeNames[0] || "direct"].filter(Boolean),
    url: "http://www.gstatic.com/generate_204",
    interval: 3600,
    tolerance: 50,
    lazy: true,
  });

  // 3. 业务层 - AI 服务
  outbounds.push({
    type: "selector",
    tag: "🤖 AI 服务",
    outbounds: ["🔮 故障转移", ...nodeNames],
    default: nodeNames[0] || "direct",
  });

  // 4. 国际媒体
  outbounds.push({
    type: "selector",
    tag: "🎬 国际媒体",
    outbounds: ["🔮 故障转移", ...nodeNames],
    default: "🔮 故障转移",
  });

  // 5. 漏网之鱼
  outbounds.push({
    type: "selector",
    tag: "🐟 漏网之鱼",
    outbounds: ["direct", "🔰 节点选择"],
    default: "direct",
  });

  // 地区选择器（保留供手动切换）
  for (const [regionName, names] of regionMap) {
    outbounds.push({
      type: "selector",
      tag: `🌏 ${regionName}`,
      outbounds: [...names, "direct"],
    });
  }

  const config = {
    log: { disabled: false, level: "warn", timestamp: true },
    dns: {
      servers: [
        { tag: "dns-direct", type: "udp", server: "223.5.5.5", server_port: 53 },
        { tag: "dns-remote", type: "https", server: "dns.google", path: "/dns-query", domain_resolver: "dns-direct", detour: "🔰 节点选择" },
        { type: "fakeip", tag: "fakeip", inet4_range: "198.18.0.0/15", inet6_range: "fc00::/18" },
      ],
      rules: [
        { clash_mode: "Direct", server: "dns-direct" },
        { clash_mode: "Global", server: "dns-remote" },
        { query_type: ["A", "AAAA"], server: "fakeip" },
      ],
      final: "dns-remote",
      strategy: "prefer_ipv4",
    },
    inbounds: [
      {
        type: "tun",
        tag: "tun-in",
        address: ["172.19.0.1/30", "fd00::1/126"],
        auto_route: true,
        strict_route: true,
      },
    ],
    outbounds,
    route: {
      rules: [
        { domain_keyword: ["openai", "anthropic", "claude"], outbound: "🤖 AI 服务" },
        { domain_keyword: ["youtube", "netflix", "googlevideo", "ytimg"], outbound: "🎬 国际媒体" },
        { ip_cidr: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "100.64.0.0/10", "127.0.0.0/8", "169.254.0.0/16"], outbound: "direct" },
        { geoip: "cn", outbound: "direct" },
        { outbound: "🐟 漏网之鱼" },
      ],
      final: "🐟 漏网之鱼",
      default_domain_resolver: { server: "dns-direct" },
      auto_detect_interface: true,
    },
    experimental: {
      cache_file: { enabled: true },
      clash_api: {
        external_controller: "127.0.0.1:9090",
        external_ui: "metacubexd",
        external_ui_download_url: "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip",
        external_ui_download_detour: "🔰 节点选择",
        default_mode: "rule",
      },
    },
  };

  return JSON.stringify(config, null, 2);
}