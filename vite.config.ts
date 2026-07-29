import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "api-proxy",
        configureServer(server) {
          server.middlewares.use("/api/chat", async (req, res, next) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Method not allowed" }));
              return;
            }

            const buffers = [];
            for await (const chunk of req) buffers.push(chunk);
            const bodyStr = Buffer.concat(buffers).toString();

            try {
              req.body = bodyStr ? JSON.parse(bodyStr) : {};
            } catch {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Invalid JSON body" }));
              return;
            }

            if (env.OPENROUTER_API_KEY) process.env.OPENROUTER_API_KEY = env.OPENROUTER_API_KEY;
            if (env.API_BASE_URL) process.env.API_BASE_URL = env.API_BASE_URL;
            if (env.SITE_URL) process.env.SITE_URL = env.SITE_URL;

            const { default: handler } = await import("./api/chat.js");
            await handler(req, res);
          });
        },
      },
    ],
  };
});