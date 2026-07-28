export function timingEqual(a, b) {
  const sa = String(a), sb = String(b);
  let d = 0;
  for (let i = 0; i < sa.length || i < sb.length; i++) d |= (sa.charCodeAt(i) || 0) ^ (sb.charCodeAt(i) || 0);
  return d === 0;
}

export function checkAuth(req, token) {
  const t = String(token || "").trim();
  if (!t) return true;
  const u = new URL(req.url);
  const q = u.searchParams.get("token") || u.searchParams.get("key") || "";
  const h = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  return timingEqual(q, t) || timingEqual(h, t);
}