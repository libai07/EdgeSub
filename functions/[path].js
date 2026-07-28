import { checkAuth } from "./auth.js";
import { getRoute } from "./router.js";
import { getConfig, getRegions, matchRegion } from "./config.js";
import { parseNodes, expandAll, collectUrls, isSafeUrl, textResponse, normalizePath } from "./utils.js";
import { clean } from "./clean.js";
import { toSingBox, toBase64 } from "./output.js";
import { fetchAll } from "./fetcher.js";

export async function onRequestGet({ request, env, params }) {
  const cfg = getConfig(env);
  if (normalizePath(params?.path) !== cfg.subPath) return textResponse("Not found", { status: 404 });
  if (!checkAuth(request, cfg.token)) return textResponse("Unauthorized", { status: 401, headers: { "WWW-Authenticate": "Bearer" } });

  const parts = [];
  if (env.NODES) parts.push(env.NODES);
  if (env.NODES_URL) {
    const urls = collectUrls(env.NODES_URL).filter(isSafeUrl);
    const fetched = await fetchAll(urls);
    if (fetched.trim()) parts.push(fetched);
  }

  const text = expandAll(parts.join("\n"));
  if (!text.includes("://")) return textResponse("# No nodes", { status: 404, headers: { "X-Subscription-Status": "empty" } });

  const parsed = parseNodes(text);
  const cleaned = clean(parsed, cfg.filter);
  const regions = getRegions(env);
  const cnt = {};

  const renamed = cleaned.map(n => {
    const r = matchRegion(n._origName || n.name, regions);
    const key = r.code === "UN" ? `UN_${Math.random().toString(36).slice(2,8)}` : r.code;
    const num = (cnt[key] = (cnt[key] || 0) + 1);
    return { ...n, name: `${r.flag} ${r.name} ${num}`, _order: r.order, _num: num };
  }).sort((a, b) => a._order - b._order || a._num - b._num || a.name.localeCompare(b.name));

  const route = getRoute(request.headers.get("User-Agent"));

  const body = route.fmt === "json" ? toSingBox(renamed, cfg) : toBase64(renamed);
  const ct = route.fmt === "json" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8";

  return textResponse(body, { headers: { "Content-Type": ct, "profile-title": `${cfg.title} · ${renamed.length} nodes` } });
}