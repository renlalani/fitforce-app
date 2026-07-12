const API_KEY = "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";
const VISION_MODEL = "qwen/qwen2.5-vl-72b-instruct:free";
const BASE = "https://openrouter.ai/api/v1/chat/completions";

export const FREE_MODELS = [
  "openrouter/free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
];

async function tryModel({ model, messages, system, maxTokens, temperature, signal, onChunk }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://fitforce-app.vercel.app",
      "X-Title": "FitForce",
    },
    body: JSON.stringify({
      model,
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
    const err = await res.json().catch(() => ({}));
    const body = err?.error || err;
    if (body?.type === "exceeded_limit" || res.status === 429) {
      const resetsAt = body?.resetsAt || body?.windows?.["5h"]?.resets_at;
      throw { rateLimited: true, resetsAt: resetsAt ? new Date(resetsAt * 1000) : new Date(Date.now() + 3600000) };
    }
    const error = new Error(body?.message || `HTTP ${res.status}`);
    error.status = res.status;
    throw error;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      if (line.includes("[DONE]")) break;
      if (!line.startsWith("data: ")) continue;
      try {
        const json = JSON.parse(line.slice(6));
        const content = json?.choices?.[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          onChunk?.(fullContent);
        }
      } catch { }
    }
  }

  return fullContent;
}

export async function streamAI({ messages, system, maxTokens = 2048, temperature = 0.7, model, signal, onChunk }) {
  const modelsToTry = model ? [model] : [...FREE_MODELS];
  let lastError;

  for (const m of modelsToTry) {
    try {
      return await tryModel({ model: m, messages, system, maxTokens, temperature, signal, onChunk });
    } catch (e) {
      if (e.rateLimited) throw e;
      if (e.status === 404) {
        console.warn(`AI model "${m}" unavailable, trying fallback...`);
        lastError = e;
        continue;
      }
      throw e;
    }
  }

  throw lastError || new Error("All AI models are currently unavailable. Please try again later.");
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
