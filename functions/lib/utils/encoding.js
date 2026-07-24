export function fromBase64(value) {
  let b64 = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function toBase64(value) {
  const bytes = new TextEncoder().encode(String(value || ""));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

const BASE64_URL_SAFE_RE = /^[A-Za-z0-9+/=_-]+$/;
const MIN_BASE64_LENGTH = 40;

export function looksLikeBase64Blob(value) {
  const compact = String(value || "").replace(/\s+/g, "");
  if (compact.length < MIN_BASE64_LENGTH) return false;
  if (compact.includes("://")) return false;
  if (!BASE64_URL_SAFE_RE.test(compact)) return false;
  if (looksLikeUrlOrPlainText(compact)) return false;
  return true;
}

function looksLikeUrlOrPlainText(value) {
  return /^(https?:\/\/|[a-z]+:|[\w.-]+\.[a-z]{2,})/i.test(value);
}