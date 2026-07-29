import { createServer } from "node:http";
import handler from "../api/chat.js";

const PORT = 3001;

const server = createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    req.body = body ? JSON.parse(body) : {};
  } catch {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid JSON body" }));
    return;
  }

  await handler(req, res);
});

server.listen(PORT, () => {
  console.log(`[FitForce Dev API] Running at http://localhost:${PORT}`);
});