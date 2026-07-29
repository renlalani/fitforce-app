const FREE_MODELS = [
  "openai/gpt-oss-20b:free",
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "openrouter/free",
];

async function tryModel(model, { apiKey, baseUrl, siteUrl, maxTokens, temperature, system, messages }) {
  return fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": siteUrl,
      "X-Title": "FitForce",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens ?? 2048,
      temperature: temperature ?? 0.7,
      stream: true,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...(messages || []),
      ],
    }),
  });
}

async function parseErrorBody(res) {
  const contentType = res.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const json = await res.json();
      return json?.error || json;
    }
    const text = await res.text().catch(() => "");
    return { message: (text || "").slice(0, 300) || `HTTP ${res.status}` };
  } catch {
    return { message: `HTTP ${res.status}` };
  }
}

async function streamResponse(openrouterRes, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  const reader = openrouterRes.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value, { stream: true }));
  }
  res.end();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const { model, models, messages, system, maxTokens, temperature } = req.body || {};

  if (!messages || !Array.isArray(messages)) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "messages field is required and must be an array" }));
    return;
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error("[FitForce API] OPENROUTER_API_KEY is not set");
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Server configuration error" }));
    return;
  }

  const modelsToTry = model ? [model] : (models?.length ? models : [...FREE_MODELS]);
  const baseUrl = process.env.API_BASE_URL || "https://openrouter.ai/api/v1/chat/completions";
  const siteUrl = process.env.SITE_URL || "https://fitforce-app.vercel.app";
  const opts = { apiKey, baseUrl, siteUrl, maxTokens, temperature, system, messages };

  let lastError;
  let rateLimited = false;
  let resetsAt;

  for (const m of modelsToTry) {
    let openrouterRes;
    try {
      openrouterRes = await tryModel(m, opts);
    } catch (err) {
      console.error(`[FitForce API] Model "${m}" network error:`, err.message);
      lastError = err;
      continue;
    }

    if (openrouterRes.ok) {
      await streamResponse(openrouterRes, res);
      return;
    }

    const body = await parseErrorBody(openrouterRes);
    lastError = new Error(body?.message || `HTTP ${openrouterRes.status}`);
    console.warn(`[FitForce API] Model "${m}" failed (${openrouterRes.status}):`, body?.message?.slice(0, 150));

    if (body?.type === "exceeded_limit" || openrouterRes.status === 429 || body?.rateLimited) {
      rateLimited = true;
      resetsAt = body?.resetsAt || body?.windows?.["5h"]?.resets_at;

      await new Promise(r => setTimeout(r, 2000));
      try {
        const retryRes = await tryModel(m, opts);
        if (retryRes.ok) {
          await streamResponse(retryRes, res);
          return;
        }
      } catch {
        // retry failed, try next model
      }
      continue;
    }

    if (openrouterRes.status === 404) {
      continue;
    }
  }

  if (rateLimited) {
    res.writeHead(429, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      isRateLimited: true,
      resetsAt: resetsAt
        ? new Date(resetsAt * 1000).toISOString()
        : new Date(Date.now() + 3600000).toISOString(),
    }));
  } else {
    const message = lastError?.message || "All AI models are currently unavailable. Please try again later.";
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: { message } }));
  }
}
