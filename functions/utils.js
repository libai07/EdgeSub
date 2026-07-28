export function normalizePath(v) {
  return String(v || "").trim().replace(/^\/+|\/+$/g, "");
}

export function getLines(v) {
  return String(v || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}

export function schemeOf(v) {
  return (String(v || "").match(/^([a-z][a-z0-9+.-]*):\/\//i) || [])[1]?.toLowerCase() || "";
}

export function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function textResponse(body, init = {}) {
  const h = new Headers(init.headers || {});
  h.set("Cache-Control", "no-store");
  h.set("X-Content-Type-Options", "nosniff");
  if (!h.has("Content-Type")) h.set("Content-Type", "text/plain; charset=utf-8");
  return new Response(body, { ...init, headers: h });
}

export function looksB64(s) {
  const c = s.replace(/\s+/g, "");
  return c.length >= 10 && /^[A-Za-z0-9+/=_-]+$/.test(c) && !c.includes("://");
}

export function tryB64(s) {
  let cur = s.replace(/\s+/g, "");
  for (let i = 0; i < 5; i++) {
    if (!looksB64(cur)) break;
    try {
      const dec = atob(cur.replace(/-/g, "+").replace(/_/g, "/"));
      if (dec.includes("://")) { cur = dec.trim(); continue; }
    } catch {}
    break;
  }
  return cur.includes("://") ? cur : "";
}

const SAFE_URL_BLACKLIST = [
  /^localhost$/i, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./, /^169\.254\./,
  /^0\./, /^::1$/i, /^::$/i, /^fc/i, /^fd/i, /^fe80:/i, /^100\./, /metadata\.google\.internal$/i
];

export function isSafeUrl(u) {
  try {
    const x = new URL(u);
    if (!["http:", "https:"].includes(x.protocol)) return false;
    const h = x.hostname.toLowerCase().replace(/\.$/, "");
    return !SAFE_URL_BLACKLIST.some(r => r.test(h));
  } catch { return false; }
}

export function collectUrls(raw) {
  const seen = new Set(), out = [];
  for (const u of String(raw || "").split(/[\s,\n\r]+/)) {
    const s = u.trim();
    if (s && !seen.has(s)) { seen.add(s); out.push(s); }
  }
  return out;
}

function readName(raw, fb) {
  const i = raw.indexOf("#");
  if (i === -1) return fb;
  const h = raw.slice(i + 1);
  try { return decodeURIComponent(h) || fb; } catch { return h || fb; }
}

function parseNode(raw) {
  try {
    const u = new URL(raw);
    const sch = schemeOf(raw);
    if (!["vless","hysteria2","anytls"].includes(sch)) return null;
    if (!u.hostname) return null;
    return { type: sch, name: readName(raw, u.hostname), raw };
  } catch { return null; }
}

const MAX_URI_LEN = 8000;
const MAX_SIZE = 512 * 1024;

export function expandAll(text) {
  let s = String(text || "").trim();
  if (s.length > MAX_SIZE) s = s.slice(0, MAX_SIZE);
  if (looksB64(s)) { const d = tryB64(s); if (d) s = d; }
  const valid = (l) => looksB64(l) || ["vless","hysteria2","anytls"].includes(schemeOf(l));
  if (s.includes("://") && !getLines(s).every(valid)) {
    const re = new RegExp(`\\b(?:vless|hysteria2|anytls):\\/\\/[^\\s]{10,${MAX_URI_LEN}}`, "gi");
    const m = s.match(re) || [];
    if (m.length) s = [...new Set(m)].filter(valid).join("\n");
  }
  return s;
}

export function parseNodes(text) {
  const expanded = expandAll(text);
  return getLines(expanded).map(parseNode).filter(Boolean);
}