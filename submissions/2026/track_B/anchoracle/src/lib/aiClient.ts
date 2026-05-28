import { GoogleGenAI } from "@google/genai";

if (process.env.NODE_ENV === "development") {
  import("undici").then(({ ProxyAgent, setGlobalDispatcher }) => {
    const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxy) setGlobalDispatcher(new ProxyAgent(proxy));
  });
}

// 单 key 模式：仅使用 GOOGLE_API_KEY（Google AI Studio）。
// 之前的多 key 轮换（GOOGLE_API_KEY_2/3/4）已移除。
const API_KEY = process.env.GOOGLE_API_KEY!;

const aiInstance = new GoogleGenAI({ apiKey: API_KEY });

export function getAI(): GoogleGenAI {
  return aiInstance;
}

export function isQuotaError(err: unknown): boolean {
  const s = String(err);
  // BUG-001: 不要把 INVALID_ARGUMENT 当成配额错误。
  return (
    s.includes("429") ||
    s.includes("RESOURCE_EXHAUSTED") ||
    s.includes("quota") ||
    s.includes("API_KEY_INVALID") ||
    s.includes("API key expired")
  );
}

// 单 key 模式下永远不切换；保留接口以避免调用方代码改动。
export function switchKey(): boolean {
  return false;
}

// 单 key 模式无需备用 key 提示。
export function consumeKeyWarning(): string | null {
  return null;
}

export function getCurrentKeyIndex(): number {
  return 0;
}

export function getKeyCount(): number {
  return 1;
}
