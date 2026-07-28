const NOTICE = [
  /剩余\s*流量\s*[:：]\s*\d/i,
  /已用\s*流量\s*[:：]\s*\d/i,
  /套餐\s*到期\s*[:：]\s*\d/i,
  /流量\s*已\s*(用完|耗尽|告罄)/i,
  /traffic\s*[:：]\s*\d/i,
  /expire\s*[:：]\s*\d/i,
];

export function clean(nodes, filterKw) {
  const seen = new Set();
  const out = [];
  for (const n of nodes) {
    const name = String(n.name || "");
    if (!name) continue;
    if (filterKw.length && !filterKw.some(k => name.toLowerCase().includes(k))) continue;
    if (NOTICE.some(r => r.test(name))) continue;
    if (seen.has(n.raw)) continue;
    seen.add(n.raw);
    out.push({ ...n, _origName: name });
  }
  return out;
}