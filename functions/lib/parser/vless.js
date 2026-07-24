import { readName } from "./common.js";

function normalizeVlessParams(params, searchStr) {
  const aliasMap = {
    network: 'type',
    'ws-path': 'path',
    'ws-host': 'host',
    'ws-headers': 'host',
    'grpc-serviceName': 'serviceName',
    'grpc-path': 'serviceName',
    mode: 'type',
  };
  let search = searchStr;
  for (const [alias, std] of Object.entries(aliasMap)) {
    if (params.has(alias) && !params.has(std)) {
      params.set(std, params.get(alias));
      search = ensureParam(search, std, params.get(alias));
    }
  }
  if (params.get('type') === 'h2') {
    params.set('type', 'httpupgrade');
    search = ensureParam(search.replace(/type=h2/, ''), 'type', 'httpupgrade');
  }
  return search;
}

function ensureParam(searchStr, key, value) {
  if (!searchStr.includes(`${key}=`)) {
    const sep = searchStr ? '&' : '';
    return `${searchStr}${sep}${key}=${encodeURIComponent(value)}`;
  }
  return searchStr;
}

export function parseVlessReality(raw, url) {
  const uuid = url.username;
  const host = url.hostname;
  const port = url.port || "443";
  if (!uuid || !host) return null;

  let search = url.search || "";
  const params = new URLSearchParams(search);
  search = normalizeVlessParams(params, search);

  const type = params.get("type") || "tcp";
  if (!params.has("type")) {
    search = ensureParam(search, "type", "tcp");
  }

  if (type !== "xhttp") {
    search = ensureParam(search, "flow", "xtls-rprx-vision");
  }

  search = ensureParam(search, "security", "reality");

  if (params.get("type") === "xhttp") {
    search = ensureParam(search, "packetEncoding", "xudp");
  }

  const base = `${url.protocol}//${uuid}@${host}:${port}${search}`;
  return {
    type: "vless",
    name: readName(raw, host),
    _raw: base + url.hash,
  };
}

export function parseVless(raw, url) {
  if (!url.username || !url.hostname) return null;
  let search = url.search || "";
  const params = new URLSearchParams(search);
  search = normalizeVlessParams(params, search);

  const security = params.get("security");
  // 仅 Reality 模式加 flow，普通 TLS (ws/grpc/h2等) 不加
  if (security === "reality" && !params.has("flow")) {
    search = ensureParam(search, "flow", "xtls-rprx-vision");
  }
  if (!params.has("type")) {
    search = ensureParam(search, "type", "tcp");
  }

  const base = `${url.protocol}//${url.username}@${url.hostname}:${url.port || "443"}${search}`;
  return {
    type: "vless",
    name: readName(raw, url.hostname),
    _raw: base + url.hash,
  };
}