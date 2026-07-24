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

export function parseHysteria2(raw, url) {
  const host = url.hostname;
  const port = url.port || "443";
  const auth = url.username || url.searchParams.get("auth") || "";
  if (!host || !auth) return null;

  let search = url.search || "";
  const params = new URLSearchParams(search);

  if (!params.has("insecure")) {
    search = ensureParam(search, "insecure", "1");
  }

  // if original url had auth param, delete from search
  if (url.searchParams.has("auth")) {
    search = removeParam(search, "auth");
  }

  const base = `hysteria2://${encodeURIComponent(auth)}@${host}:${port}${search}`;
  return {
    type: "hysteria2",
    name: readName(raw, host),
    _raw: base + url.hash,
  };
}