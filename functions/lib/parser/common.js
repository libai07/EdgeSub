import { fromBase64, looksLikeBase64Blob } from "../utils/encoding.js";
import { getLines } from "../utils/index.js";

export const SUPPORTED_PROTOCOLS = ["vless", "hysteria2", "anytls"];

export function parseURL(raw) {
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

export function isRealityParams(url) {
  if (!url) return false;
  const security = url.searchParams.get("security");
  const pbk = url.searchParams.get("pbk");
  return security === "reality" && pbk !== null;
}

export function isSupportedNodeLink(value) {
  return SUPPORTED_PROTOCOLS.includes(schemeOf(value));
}

export function readName(raw, fallback) {
  const hashIdx = raw.indexOf("#");
  if (hashIdx !== -1) {
    const hash = raw.slice(hashIdx + 1);
    try {
      return decodeURIComponent(hash) || fallback;
    } catch {
      return hash || fallback;
    }
  }
  return fallback;
}

export function expandSubscriptionText(text) {
  const trimmed = String(text || "").trim();

  if (looksLikeBase64Blob(trimmed)) {
    const decoded = tryBase64Decode(trimmed);
    if (decoded) return decoded;
  }

  if (trimmed.includes("://") && !getLines(trimmed).every(isSupportedNodeLink)) {
    const re = new RegExp(`\\b(?:${SUPPORTED_PROTOCOLS.join("|")}):\\/\\/[^\\s"'<>\\]\\)]+`, "gi");
    const found = trimmed.match(re) || [];
    if (found.length) return found.join("\n");
  }

  return text;
}

export function expandLineIfEncoded(line) {
  const trimmed = stripWrapping(String(line || "").trim());
  if (!trimmed) return [];
  if (/^https?:\/\//i.test(trimmed)) return [];

  if (looksLikeBase64Blob(trimmed)) {
    const decoded = tryBase64Decode(trimmed);
    if (decoded) return getLines(decoded);
  }

  return [trimmed];
}

function tryBase64Decode(value) {
  try {
    const decoded = fromBase64(String(value || "").replace(/\s+/g, ""));
    return decoded && decoded.includes("://") ? decoded : "";
  } catch {
    return "";
  }
}

export function schemeOf(value) {
  return String(value || "").match(/^([a-z][a-z0-9+.-]*):\/\//i)?.[1]?.toLowerCase() || "";
}

export function stripWrapping(value) {
  return String(value || "").trim().replace(/^[\"'`]+|[\"'`,}]+$/g, "");
}