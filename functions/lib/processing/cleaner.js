import { detectRegion, UNKNOWN_REGION } from "../config/regions.js";

const STRONG_NOTICE_PATTERNS = [
  /剩余\s*流量\s*[:：]\s*\d/i,
  /已用\s*流量\s*[:：]\s*\d/i,
  /总\s*流量\s*[:：]\s*\d/i,
  /流量\s*重置\s*[:：]\s*\d/i,
  /套餐\s*到期\s*[:：]\s*\d/i,
  /到期\s*时间\s*[:：]\s*\d/i,
  /过期\s*时间\s*[:：]\s*\d/i,
  /traffic\s*[:：]\s*\d/i,
  /remaining\s*[:：]\s*\d/i,
  /expire\s*[:：]\s*\d/i,
  /expired\s*[:：]\s*\d/i,
  /reset\s*[:：]\s*\d/i,
  /used\s*[:：]\s*\d/i,
];

/**
 * @param {Record<string,string>} env
 * @returns {string[]}
 */
function getFilterKeywords(env) {
  const raw = String(env?.FILTER || "").trim();
  if (!raw) return [];
  return raw.split(/\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
}

/**
 * @param {string} name
 * @param {string[]} keywords
 * @returns {boolean}
 */
function passesFilter(name, keywords) {
  if (!keywords.length) return true;
  const lower = name.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * 清洗节点：过滤、重命名、按地区排序
 * @param {Array<{name: string, _raw: string, type: string}>} nodes
 * @param {Record<string,string>} env
 * @returns {Array<{name: string, _raw: string, type: string, _region: Object, _order: number}>}
 */
export function cleanNodes(nodes, env = {}) {
  const counters = {};
  const out = [];
  const filterKeywords = getFilterKeywords(env);

  for (const node of nodes) {
    const name = String(node?.name || "");
    if (!name) continue;

    if (!passesFilter(name, filterKeywords)) continue;

    if (STRONG_NOTICE_PATTERNS.some((re) => re.test(name))) continue;

    const region = detectRegion(name) || UNKNOWN_REGION;

    const n = (counters[region.code] || 0) + 1;
    counters[region.code] = n;

    const newName = `${region.flag} ${region.name} ${n}`;

    out.push({ ...node, name: newName, _region: region, _order: region.order });
  }

  out.sort((a, b) => a._order - b._order);

  return out.map(({ _order, ...rest }) => rest);
}