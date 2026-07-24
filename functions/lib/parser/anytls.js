import { readName } from "./common.js";

function ensureParam(searchStr, key, value) {
  if (!searchStr.includes(`${key}=`)) {
    const sep = searchStr ? '&' : '';
    return `${searchStr}${sep}${key}=${encodeURIComponent(value)}`;
  }
  return searchStr;
}

function removeParam(searchStr, key) {
  if (!searchStr) return "";
  const params = searchStr.replace(/^\?/, '').split('&');
  const filtered = params.filter(p => !p.startsWith(key + '='));
  if (!filtered.length) return "";
  return '?' + filtered.join('&');
}

export function parseAnytls(raw, url) {
  const host = url.hostname;
  const port = url.port || "443";
  const auth = url.username || url.searchParams.get("password") || "";
  if (!host || !auth) return null;

  let search = url.search || "";
  const params = new URLSearchParams(search);

  const security = params.get("security") || "tls";

  if (!params.has("fp")) {
    search = ensureParam(search, "fp", "chrome");
  }
  if (!params.has("type")) {
    search = ensureParam(search, "type", "tcp");
  }

  // delete password from search (string manipulation, preserves order)
  if (url.searchParams.has("password")) {
    search = removeParam(search, "password");
  }

  const base = `anytls://${encodeURIComponent(auth)}@${host}:${port}${search}`;
  return {
    type: "anytls",
    name: readName(raw, host),
    _raw: base + url.hash,
  };
}