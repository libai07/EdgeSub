const ROUTES = [
  { match: /sing-box|sfa|sfi|sfm/i, fmt: "json" },
  { match: /shadowrocket/i, fmt: "base64" },
  { match: /v2rayn/i,       fmt: "base64" },
  { match: /v2rayng/i,      fmt: "base64" },
];

const FALLBACK = { fmt: "base64" };

export function getRoute(ua) {
  const s = (ua || "").toLowerCase();
  for (const r of ROUTES) if (r.match.test(s)) return r;
  return FALLBACK;
}