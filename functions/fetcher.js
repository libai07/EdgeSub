import { expandAll, isSafeUrl } from "./utils.js";

const TIMEOUT = 8000;
const MAX_SIZE = 512 * 1024;
const MAX_REDIR = 5;

async function fetchOne(u) {
  if (!/^https?:\/\//i.test(u) || !isSafeUrl(u)) return "";
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    let cur = u;
    for (let i = 0; i < MAX_REDIR; i++) {
      const r = await fetch(cur, { signal: ctrl.signal, redirect: "manual", headers: { "User-Agent": "EdgeSub" } });
      if ([301,302,303,307,308].includes(r.status)) {
        const loc = r.headers.get("location");
        if (!loc) break;
        const next = new URL(loc, cur).toString();
        if (!isSafeUrl(next)) break;
        cur = next; continue;
      }
      if (!r.ok) break;
      let t = await r.text();
      if (t.length > MAX_SIZE) {
        t = t.slice(0, MAX_SIZE);
        const lastNL = Math.max(t.lastIndexOf("\n"), t.lastIndexOf("\r"));
        if (lastNL > MAX_SIZE - 4096) t = t.slice(0, lastNL + 1);
      }
      t = expandAll(t);
      if (!t.includes("://")) break;
      return t;
    }
  } catch {} finally { clearTimeout(id); }
  return "";
}

export async function fetchAll(urls) {
  const results = await Promise.all(urls.map(fetchOne));
  return results.filter(Boolean).join("\n");
}