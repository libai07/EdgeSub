import { getLines } from "../utils/index.js";
import {
  isSupportedNodeLink, isRealityParams,
  parseURL, schemeOf, stripWrapping,
  expandSubscriptionText, expandLineIfEncoded,
  SUPPORTED_PROTOCOLS,
} from "./common.js";
import { parseVless, parseVlessReality } from "./vless.js";
import { parseHysteria2 } from "./hysteria2.js";
import { parseAnytls } from "./anytls.js";

export function parseNodes(value) {
  const text = expandSubscriptionText(String(value || ""));
  return getLines(text)
    .flatMap(expandLineIfEncoded)
    .map(parseNode)
    .filter(Boolean);
}

function parseNode(value) {
  const raw = stripWrapping(String(value || "").trim());
  if (!raw || !isSupportedNodeLink(raw)) return null;

  const scheme = schemeOf(raw);
  const url = parseURL(raw);
  if (!url) return null;

  if (scheme === "vless" && isRealityParams(url)) return parseVlessReality(raw, url);
  if (scheme === "vless") return parseVless(raw, url);
  if (scheme === "hysteria2") return parseHysteria2(raw, url);
  if (scheme === "anytls") return parseAnytls(raw, url);
  return null;
}
