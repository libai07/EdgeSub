import { textResponse } from "./lib/utils/index.js";
import { normalizePath } from "./lib/utils/index.js";
import { handleSubscription } from "./lib/handler.js";

export async function onRequestGet(context) {
  const requestPath = normalizePath(String(context.params?.path || ""));
  const subPath = normalizePath(String(context.env?.SUB_PATH || ""));

  if (!subPath || requestPath !== subPath) {
    return textResponse("Not found", { status: 404 });
  }

  return handleSubscription(context.request, context.env);
}
