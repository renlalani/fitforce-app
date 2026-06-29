const API_KEY = "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";
const MODEL = "poolside/laguna-xs.2:free";
const BASE = "https://openrouter.ai/api/v1/chat/completions";

export async function streamAI({ messages, system, maxTokens = 2048, temperature = 0.7, signal, onChunk }) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://fitforce-app.vercel.app",
      "X-Title": "FitForce",
    },
    body: JSON.stringify({
      model: MODEL,
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
    throw new Error(body?.message || `HTTP ${res.status}`);
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

export async function callAI({ messages, system, maxTokens = 1024, temperature = 0.7 }) {
  let result = "";
  await streamAI({
    messages,
    system,
    maxTokens,
    temperature,
    onChunk: (text) => { result = text; },
  });
  return result;
}
