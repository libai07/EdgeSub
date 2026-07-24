import { looksLikeBase64Blob, fromBase64 } from "../utils/encoding.js";
import { createLogger } from "../utils/logger.js";

const FETCH_TIMEOUT_MS = 8000;
const FETCH_SIZE_LIMIT = 512 * 1024;
const MAX_REDIRECTS = 5;

/**
 * @typedef {Object} FetchResult
 * @property {boolean} ok
 * @property {string} [text]
 * @property {number} [lines]
 * @property {string} [error]
 */

/**
 * 从环境变量解析订阅 URL 列表
 * @param {string} nodesUrlRaw
 * @returns {string[]}
 */
export function collectNodesUrls(nodesUrlRaw) {
  const urls = [];
  const seen = new Set();

  for (const item of splitNodesUrlList(nodesUrlRaw)) {
    const url = String(item || "").trim();
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

/**
 * @param {string} value
 * @returns {string[]}
 */
function splitNodesUrlList(value) {
  return String(value || "")
    .split(/[\r\n,|\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * 抓取远程订阅，视为 Base64 格式，单次抓取 + Base64 解码
 * @param {string} url
 * @param {Record<string,string>} env
 * @returns {Promise<FetchResult>}
 */
export async function fetchNodesUrl(url, env = {}) {
  const logger = createLogger(env);

  try {
    const res = await fetchWithTimeout(url, FETCH_TIMEOUT_MS, MAX_REDIRECTS);
    if (!res.ok) {
      const msg = `HTTP ${res.status}`;
      logger.debug("fetch failed", { url, status: res.status });
      return { ok: false, error: msg };
    }

    let text = await res.text();
    if (text.length > FETCH_SIZE_LIMIT) {
      logger.warn("NODES_URL too large, truncated", { url, size: text.length, limit: FETCH_SIZE_LIMIT });
      text = text.slice(0, FETCH_SIZE_LIMIT);
    }

    const decoded = normalizeRemoteSubscriptionText(text);
    if (!decoded.text.includes("://")) {
      return { ok: false, error: "content has no valid node links" };
    }

    const lines = decoded.text.split(/\r?\n/).filter(Boolean);
    logger.info("fetch ok", { url, lines: lines.length });
    return { ok: true, text: decoded.text, lines: lines.length };
  } catch (err) {
    const msg = `${err?.name || "Error"}: ${err?.message || err}`;
    logger.warn("fetch error", { url, error: err?.message });
    return { ok: false, error: msg };
  }
}

/**
 * 带超时、重定向限制、SSRF 防护的 fetch
 * @param {string} url
 * @param {number} timeoutMs
 * @param {number} maxRedirects
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeoutMs, maxRedirects) {
  let currentUrl = url;
  let redirectCount = 0;

  while (redirectCount <= maxRedirects) {
    const res = await fetch(currentUrl, {
      signal: AbortSignal.timeout(timeoutMs),
      cf: { cacheTtl: 60, cacheEverything: false },
      headers: { "User-Agent": "EdgeSub", Accept: "*/*" },
      redirect: "manual",
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = res.headers.get("location");
      if (!location) return res;
      const nextUrl = new URL(location, currentUrl).toString();
      if (!isSafeFetchUrl(nextUrl)) {
        throw new Error(`redirect to blocked destination: ${nextUrl}`);
      }
      currentUrl = nextUrl;
      redirectCount++;
      continue;
    }

    return res;
  }

  throw new Error(`too many redirects (>${maxRedirects})`);
}

/**
 * 规范化远程订阅文本：自动解码 Base64
 * @param {string} value
 * @returns {{text: string}}
 */
function normalizeRemoteSubscriptionText(value) {
  let text = String(value || "");
  const trimmed = text.trim();

  if (looksLikeBase64Blob(trimmed)) {
    try {
      const decoded = fromBase64(trimmed);
      if (decoded.includes("://")) {
        text = decoded;
      }
    } catch {}
  }
  return { text };
}

/**
 * SSRF 防护：拦截内网/元数据/本地地址
 * @param {string} input
 * @returns {boolean}
 */
export function isSafeFetchUrl(input) {
  try {
    const u = new URL(input);
    if (!["http:", "https:"].includes(u.protocol)) return false;
    const host = u.hostname.toLowerCase();

    const blocked = [
      /^localhost$/i,
      /^127\./,
      /^10\./,
      /^172\.(1[6-9]|2\d|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\./,
      /^\[::1\]/i,
      /^\[::\]$/i,
      /^\[fc/i,
      /^\[fe80:/i,
      /^\[::ffff:127\./i,
      /^\[::ffff:10\./i,
      /^\[::ffff:172\.(1[6-9]|2\d|3[01])\./i,
      /^\[::ffff:192\.168\./i,
      /^\[::ffff:169\.254\./i,
      /^\[::ffff:0\./i,
      /metadata\.google\.internal$/i,
      /169\.254\.169\.254/,
    ];
    return !blocked.some((rx) => rx.test(host));
  } catch {
    return false;
  }
}