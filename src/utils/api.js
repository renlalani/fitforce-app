const BASE = "/api/chat";

const SAFETY_PATTERNS = [
  /^user\s*safety:?\s*safe/i,
  /^content\s*moderation/i,
  /^i'?m?\s*sorry,\s*i\s*cannot/i,
  /^i\s*cannot\s*(fulfill|complete|generate|provide|create|answer)/i,
  /^i\s*don'?t?\s*have\s*(enough\s*)?information/i,
  /^it\s*seems\s*like\s*you'?re?\s*asking/i,
  /^my\s*(purpose|role)\s*is/i,
];

function isValidResponse(text) {
  if (!text || !text.trim()) return false;
  const trimmed = text.trim();
  if (trimmed.length < 5) return false;
  for (const pattern of SAFETY_PATTERNS) {
    if (pattern.test(trimmed)) return false;
  }
  return true;
}

async function tryModel({ model, messages, system, maxTokens, temperature, signal, onChunk }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...(model ? { model } : {}),
      max_tokens: maxTokens,
      temperature,
      stream: true,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...messages,
      ],
    }),
    signal,
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    let body;
    try {
      if (contentType.includes("application/json")) {
        body = await res.json();
      } else {
        const text = await res.text().catch(() => "");
        if (process.env.NODE_ENV === "development") {
          console.warn(`[API] Non-JSON error response (${res.status}):`, text.slice(0, 200));
        }
        body = { message: text || `HTTP ${res.status}` };
      }
    } catch {
      body = { message: `HTTP ${res.status}` };
    }
    const err = body?.error || body;
    if (err?.isRateLimited || err?.type === "exceeded_limit" || res.status === 429 || err?.rateLimited) {
      const rAt = err?.resetsAt;
      throw { rateLimited: true, resetsAt: rAt ? new Date(rAt) : new Date(Date.now() + 3600000) };
    }
    const error = new Error(err?.message || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let dataEventCount = 0;

  if (process.env.NODE_ENV === "development") {
    console.log(`[API] Streaming started${model ? ` (model: ${model})` : ""}`);
  }

  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed.includes("[DONE]")) { streamDone = true; break; }
      if (!trimmed.startsWith("data: ")) continue;
      dataEventCount++;
      const dataStr = trimmed.slice(6).trim();
      if (dataStr === "[CLEAR]") {
        fullContent = "";
        if (onChunk?.("") === false) { streamDone = true; break; }
        continue;
      }
      try {
        const json = JSON.parse(dataStr);
        const content = json?.choices?.[0]?.delta?.content;
        if (content) {
          fullContent += content;
          if (onChunk?.(fullContent) === false) {
            streamDone = true;
            break;
          }
        } else if (process.env.NODE_ENV === "development" && dataEventCount <= 3) {
          const keys = Object.keys(json?.choices?.[0]?.delta || {});
          console.log(`[API] SSE event #${dataEventCount}: keys=[${keys.join(",")}] finish=${json?.choices?.[0]?.finish_reason || "null"}`);
        }
      } catch { }
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[API] Streaming finished: ${dataEventCount} SSE events, ${fullContent.length} chars`);
  }

  if (!isValidResponse(fullContent)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[API] Invalid response (${fullContent.length} chars):`, JSON.stringify(fullContent.slice(0, 150)));
    }
    return "";
  }

  return fullContent;
}

export async function streamAI({ messages, system, maxTokens = 2048, temperature = 0.7, model, signal, onChunk }) {
  return tryModel({ model, messages, system, maxTokens, temperature, signal, onChunk });
}

export async function callAI({ messages, system, maxTokens = 1024, temperature = 0.7, model }) {
  let result = "";
  await streamAI({
    messages,
    system,
    maxTokens,
    temperature,
    model,
    onChunk: (text) => { result = text; },
  });
  return result;
}
