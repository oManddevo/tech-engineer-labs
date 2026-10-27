import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { validateSite } from "./src/data/validateSite.js";

const SITE_FILE = fileURLToPath(new URL("./src/data/site.json", import.meta.url));
const LOOPBACK_ADDRESSES = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const MAX_BODY_BYTES = 1024 * 1024;

const isLocalOrigin = (origin) => {
  try {
    return LOOPBACK_HOSTS.has(new URL(origin).hostname);
  } catch {
    return false;
  }
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Content is too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });

// Dev-server API behind the /edit page: GET /__site returns src/data/site.json, PUT validates and saves it.
// Only answers this machine, and only pages served from localhost may save (so other sites can't write to it).
function siteEditorApi() {
  return {
    name: "site-editor-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__site", async (req, res) => {
        const send = (status, body) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(body));
        };

        if (!LOOPBACK_ADDRESSES.has(req.socket.remoteAddress)) return send(403, { error: "Editor is local only" });

        if (req.method === "GET") {
          return send(200, JSON.parse(await readFile(SITE_FILE, "utf8")));
        }

        if (req.method === "PUT") {
          if (!req.headers["content-type"]?.startsWith("application/json")) {
            return send(415, { error: "Expected JSON" });
          }
          if (!isLocalOrigin(req.headers.origin)) return send(403, { error: "Saving is only allowed from localhost" });

          let site;
          try {
            site = JSON.parse(await readBody(req));
          } catch (err) {
            return send(400, { error: err.message });
          }
          const error = validateSite(site);
          if (error) return send(422, { error });

          await writeFile(SITE_FILE, `${JSON.stringify(site, null, 2)}\n`);
          return send(200, { ok: true });
        }

        send(405, { error: "Method not allowed" });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), siteEditorApi()],
});
