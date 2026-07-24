export function normalizePath(value) {
  return String(value || "").trim().replace(/^\/+|\/+$/g, "");
}

export function getLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function textResponse(body, init = {}) {
  const { headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders || {});
  headers.set("Cache-Control", "no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("X-Content-Type-Options", "nosniff");
  if (!initHeaders || !initHeaders["Content-Type"]) {
    headers.set("Content-Type", "text/plain; charset=utf-8");
  }
  return new Response(body, { ...rest, headers });
}