import { textResponse } from "./utils/index.js";
import { parseNodes } from "./parser/index.js";
import { cleanNodes } from "./processing/cleaner.js";
import { collectNodesUrls, fetchNodesUrl, isSafeFetchUrl } from "./processing/fetcher.js";
import { createLogger } from "./utils/logger.js";
import { timingSafeEqual, safeUrlLabel } from "./auth.js";
import { getRoute, getFormatter } from "./router.js";

const PROFILE_UPDATE_INTERVAL_HOURS = 12;

const CLIENT_FILTERS = {
  shadowrocket: ["vless", "hysteria2", "anytls"],
  v2rayn:       ["vless", "hysteria2", "anytls"],
  v2rayng:      ["vless", "hysteria2"],
  singbox:      ["vless", "hysteria2", "anytls"],
};

function filterNodes(nodes, client) {
  const allowed = CLIENT_FILTERS[client];
  if (!allowed) return nodes;
  return nodes.filter(n => allowed.includes(n.type));
}

function wrapResponse(res, nodeCount, env) {
  const h = new Headers(res.headers);
  h.set("Cache-Control", "no-store, no-cache, must-revalidate, private, max-age=0");
  h.set("Pragma", "no-cache");
  h.set("X-Frame-Options", "DENY");
  h.set("Referrer-Policy", "no-referrer");
  h.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  const subTitle = String(env?.SUB_TITLE || "").trim() || `EdgeSub · ${nodeCount} nodes`;
  h.set("profile-update-interval", String(PROFILE_UPDATE_INTERVAL_HOURS));
  h.set("profile-title", subTitle);

  return new Response(res.body, { status: res.status, headers: h });
}

export async function handleSubscription(request, env) {
  const logger = createLogger(env);
  const subToken = String(env?.SUB_TOKEN || "").trim();

  if (subToken) {
    const url = new URL(request.url);
    const qToken = url.searchParams.get("token") || url.searchParams.get("key") || "";
    const hToken = (request.headers.get("Authorization") || "")
      .replace(/^Bearer\s+/i, "");

    if (!timingSafeEqual(qToken, subToken) && !timingSafeEqual(hToken, subToken)) {
      logger.warn("unauthorized access attempt", { path: url.pathname });
      return textResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": "Bearer" },
      });
    }
  }

  const nodeParts = [];
  const nodesFromEnv = String(env?.NODES || "");
  const fetchDiagnostics = [];

  if (nodesFromEnv) nodeParts.push(nodesFromEnv);

  const nodesUrlRaw = String(env?.NODES_URL || "").trim();

  if (nodesUrlRaw) {
    for (const nodesUrl of collectNodesUrls(nodesUrlRaw)) {
      if (!/^https?:\/\//i.test(nodesUrl)) continue;

      if (!isSafeFetchUrl(nodesUrl)) {
        const label = safeUrlLabel(nodesUrl);
        fetchDiagnostics.push(`SSRF filter: ${label}`);
        logger.warn("NODES_URL blocked by SSRF filter", { url: label });
        continue;
      }

      const fetched = await fetchNodesUrl(nodesUrl, env);
      if (fetched.ok) {
        nodeParts.push(fetched.text);
        logger.debug("fetched nodes", { url: safeUrlLabel(nodesUrl), lines: fetched.lines });
      } else {
        fetchDiagnostics.push(`${fetched.error}: ${safeUrlLabel(nodesUrl)}`);
        logger.warn("NODES_URL fetch failed", { url: safeUrlLabel(nodesUrl), error: fetched.error });
      }
    }
  }

  const nodesText = nodeParts.join("\n");

  if (!nodesText.trim()) {
    const hints = [
      "# No nodes configured or fetched.",
      "# Set NODES to proxy links, or set NODES_URL to remote subscription URLs.",
    ];
    if (fetchDiagnostics.length) {
      for (const msg of fetchDiagnostics) hints.push(`# ${msg}`);
    }
    return textResponse(`${hints.join("\n")}\n`, { status: 200 });
  }

  const rawNodes = parseNodes(nodesText);
  const allNodes = cleanNodes(rawNodes, env);
  const route = getRoute(request);
  if (!route) return textResponse("Not found", { status: 404 });
  const nodes = filterNodes(allNodes, route.client);
  const formatter = getFormatter(route.fmt);
  const body = formatter.fn(nodes, env);
  const res = textResponse(body, { headers: { "Content-Type": formatter.type } });
  logger.info("subscription served", { client: route.client, format: route.fmt, nodes: nodes.length });
  return wrapResponse(res, nodes.length, env);
}
