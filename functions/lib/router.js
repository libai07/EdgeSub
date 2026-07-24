import { toSingBoxJson } from "./formatter/singbox.js";
import { toBase64Subscription } from "./formatter/base64.js";

const ROUTES = [
  { match: /shadowrocket/i,        client: "shadowrocket", fmt: "base64" },
  { match: /v2rayn/i,              client: "v2rayn",       fmt: "base64" },
  { match: /v2rayng/i,             client: "v2rayng",      fmt: "base64" },
  { match: /sing-box|sfa\/|sfi\/|sfm\//i, client: "singbox", fmt: "json" },
];

const FORMATTERS = {
  json:   { type: "application/json; charset=utf-8", fn: toSingBoxJson },
  base64: { type: "text/plain; charset=utf-8", fn: toBase64Subscription },
};

export function getRoute(request) {
  const ua = (request.headers.get("User-Agent") || "").toLowerCase();
  for (const route of ROUTES) {
    if (route.match.test(ua)) return route;
  }
  return null;
}

export function getFormatter(fmt) {
  return FORMATTERS[fmt];
}
