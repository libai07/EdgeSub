import { toBase64 } from "../utils/encoding.js";

function withCleanName(node) {
  const raw = String(node?._raw || "").trim();
  const name = String(node?.name || "").trim();
  if (!raw || !name) return "";
  return `${raw.split("#")[0]}#${encodeURIComponent(name)}`;
}

export function toBase64Subscription(nodes, env = {}) {
  const lines = nodes.map(withCleanName).filter(Boolean);
  return toBase64(lines.join("\n"));
}