export function timingSafeEqual(a, b) {
  const sa = String(a);
  const sb = String(b);
  if (sa.length !== sb.length) return false;
  let diff = 0;
  for (let i = 0; i < sa.length; i++) {
    diff |= sa.charCodeAt(i) ^ sb.charCodeAt(i);
  }
  return diff === 0;
}

export function safeUrlLabel(value) {
  try {
    const u = new URL(String(value || ""));
    return `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ""}`;
  } catch { return ""; }
}
