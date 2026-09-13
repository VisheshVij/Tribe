#!/usr/bin/env node
/**
 * TRIBE — local static file server.
 *
 * Zero dependencies (uses only Node's built-in `http`, `fs`, `path` modules)
 * so `node server.js` works immediately after cloning the repo — no
 * `npm install` required.
 *
 * This is for LOCAL TESTING only. On Vercel, TRIBE deploys as a plain
 * static site (index.html + assets/) and this file is not used — Vercel
 * serves the files directly without needing a running Node process.
 *
 * Usage:
 *   node server.js
 *   (optionally) PORT=5173 node server.js
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DEFAULT_PORT = 3000;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".jsx": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8",
};

function safeResolve(urlPath) {
  // Strip query string / hash, decode, then confine to project root so a
  // request like "/../../etc/passwd" can never escape ROOT.
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const resolved = path.normalize(path.join(ROOT, decoded));
  if (!resolved.startsWith(ROOT)) return null;
  return resolved;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Cache-Control": "no-cache", ...headers });
  res.end(body);
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send(res, 500, `500 Internal Server Error\n\n${err.message}`, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      console.error(`[TRIBE] Error reading ${filePath}:`, err.message);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    send(res, 200, data, { "Content-Type": contentType });
  });
}

const server = http.createServer((req, res) => {
  try {
    let filePath = safeResolve(req.url === "/" ? "/index.html" : req.url);

    if (!filePath) {
      send(res, 400, "400 Bad Request", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      fs.stat(filePath, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          // SPA-style fallback: TRIBE is a single-page app, so any unknown
          // path (e.g. a deep link or a refresh on a client-side "screen")
          // still gets index.html rather than a dead-end 404.
          const indexPath = path.join(ROOT, "index.html");
          fs.access(indexPath, fs.constants.R_OK, (err3) => {
            if (err3) {
              send(
                res,
                404,
                `404 Not Found\n\n"${req.url}" was not found, and no index.html exists to fall back to.`,
                { "Content-Type": "text/plain; charset=utf-8" }
              );
              return;
            }
            serveFile(indexPath, res);
          });
          return;
        }
        serveFile(filePath, res);
      });
    });
  } catch (e) {
    console.error("[TRIBE] Unexpected server error:", e);
    send(res, 500, `500 Internal Server Error\n\n${e.message}`, {
      "Content-Type": "text/plain; charset=utf-8",
    });
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n[TRIBE] Port ${PORT} is already in use.\n` +
      `        Close whatever is using it, or start with a different port:\n` +
      `        PORT=5173 node server.js\n`
    );
  } else {
    console.error("\n[TRIBE] Failed to start server:", err.message, "\n");
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────────────┐
  │  TRIBE is running                                    │
  │                                                       │
  │  Local:  http://localhost:${PORT}${" ".repeat(Math.max(0, 24 - String(PORT).length))}│
  │                                                       │
  │  Press Ctrl+C to stop.                               │
  └─────────────────────────────────────────────────────┘
  `);
});
