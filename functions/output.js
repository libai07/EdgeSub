import { toBase64 as toB64 } from "./utils.js";

export function toBase64(nodes) {
  const lines = nodes.map(n => `${n.raw.split("#")[0]}#${encodeURIComponent(n.name)}`);
  return toB64(lines.join("\n"));
}

export function toSingBox(nodes, cfg) {
  const outs = nodes.map(nodeToOutbound).filter(Boolean);
  const tags = outs.map(o => o.tag);
  return JSON.stringify({
    log: { level: "warn", timestamp: true },
    dns: {
      servers: [
        { tag: "dns-direct", type: "udp", server: cfg.dnsDirect },
        { tag: "dns-remote", type: "https", server: cfg.dnsRemote, path: "/dns-query", detour: "🔰 节点选择" },
        { type: "fakeip", tag: "fakeip", inet4_range: "198.18.0.0/15", inet6_range: "fc00::/18" }
      ],
      rules: [
        { domain_suffix: "cn", server: "dns-direct" },
        { domain_keyword: ["google","github","cloudflare","microsoft","apple","amazon","facebook","twitter","youtube","netflix"], server: "dns-remote" },
        { query_type: ["A","AAAA"], server: "fakeip" }
      ],
      final: "dns-remote", strategy: "prefer_ipv4"
    },
    inbounds: [{
      type: "tun", tag: "tun-in", interface_name: cfg.tunInterface,
      address: ["172.28.0.1/30", "fdfe:dcba:9876::1/126"],
      route_address: ["0.0.0.0/0", "::/0"],
      route_exclude_address: ["192.168.0.0/16","10.0.0.0/8","172.16.0.0/12","fc00::/7"],
      stack: "system", auto_route: true, strict_route: true, auto_redirect: false,
      dns_mode: "hijack", dns_address: ["172.28.0.2","fdfe:dcba:9876::2"], mtu: 9000
    }],
    outbounds: [
      { type: "direct", tag: "direct" },
      ...outs,
      { type: "selector", tag: "🔰 节点选择", outbounds: tags, default: tags[0] || "direct" }
    ],
    route: {
      rules: [
        { ip_cidr: ["10.0.0.0/8","172.16.0.0/12","192.168.0.0/16","100.64.0.0/10","127.0.0.0/8","169.254.0.0/16","fc00::/7","fe80::/10"], outbound: "direct" },
        { outbound: "🔰 节点选择" }
      ],
      final: "🔰 节点选择", auto_detect_interface: true
    },
    experimental: { cache_file: { enabled: true } }
  });
}

function nodeToOutbound(n) {
  try {
    const u = new URL(n.raw);
    const tag = n.name;
    const server = u.hostname;
    const port = parseInt(u.port) || 443;
    const q = Object.fromEntries(u.searchParams);
    const auth = u.username ? decodeURIComponent(u.username) : "";

    if (n.type === "vless") return buildVless(tag, server, port, auth, q);
    if (n.type === "hysteria2") return buildHysteria2(tag, server, port, auth, q);
    if (n.type === "anytls") return buildAnyTLS(tag, server, port, auth, q);
  } catch { return null; }
}

function buildVless(tag, server, port, uuid, q) {
  const net = q.type || "tcp";
  const isReality = q.security === "reality" && q.pbk;
  const tls = q.security !== "none" ? {
    enabled: true,
    server_name: q.sni || server,
    insecure: q.insecure === "1" || q.allowInsecure === "1",
    utls: { enabled: true, fingerprint: q.fp || "chrome" },
    ...(isReality ? { reality: { enabled: true, public_key: q.pbk, short_id: q.sid } } : {})
  } : undefined;
  const ob = { type: "vless", tag, server, server_port: port, uuid, flow: net === "tcp" && tls ? (q.flow || "xtls-rprx-vision") : undefined, tls };
  if (["ws","grpc","httpupgrade","h2","http","xhttp"].includes(net)) ob.transport = buildTransport(net, q);
  return ob;
}

function buildHysteria2(tag, server, port, password, q) {
  return {
    type: "hysteria2", tag, server, server_port: port, password,
    tls: { enabled: true, server_name: q.sni || server, insecure: q.insecure === "1", alpn: ["h3"] },
    ...(q.up_mbps ? { up_mbps: parseInt(q.up_mbps) } : {}),
    ...(q.down_mbps ? { down_mbps: parseInt(q.down_mbps) } : {}),
    ...(q.ports ? { ports: q.ports } : {})
  };
}

function buildAnyTLS(tag, server, port, password, q) {
  const isReality = q.security === "reality" && q.pbk;
  const tls = q.security !== "none" ? {
    enabled: true,
    server_name: q.sni || server,
    insecure: q.insecure === "1" || q.allowInsecure === "1",
    utls: { enabled: true, fingerprint: q.fp || "chrome" },
    ...(isReality ? { reality: { enabled: true, public_key: q.pbk, short_id: q.sid } } : {})
  } : undefined;
  return { type: "anytls", tag, server, server_port: port, password, tls };
}

function buildTransport(net, q) {
  const path = q.path || "/";
  const host = q.host || "";
  const t = { type: net };
  if (net === "ws") { t.path = path; if (host) t.headers = { Host: host.split(",")[0].trim() }; }
  if (["httpupgrade","h2","http"].includes(net)) { t.path = path; if (host) t.host = host.split(",").map(h => h.trim()); }
  if (net === "grpc") t.service_name = path;
  if (net === "xhttp") { t.path = path; if (host) t.host = host.split(",").map(h => h.trim()); if (q.mode) t.mode = q.mode; if (q.packetEncoding) t.packet_encoding = q.packetEncoding; }
  return t;
}