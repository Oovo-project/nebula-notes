const http = require("http");
const fs = require("fs");
const path = require("path");

const DEFAULT_PORT = Number(process.env.PORT || 8000);
const ROOT = __dirname;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const reqPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = reqPath === "/" ? "/index.html" : reqPath;
  const filePath = path.join(ROOT, relativePath);

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("403 Forbidden");
    return;
  }

  sendFile(filePath, res);
});

let currentPort = DEFAULT_PORT;

function startServer(port) {
  currentPort = port;
  server.listen(port, () => {
    console.log(`Server running: http://localhost:${port}`);
  });
}

server.on("error", (err) => {
  if (err && err.code === "EADDRINUSE") {
    const fallbackPort = currentPort === 8000 ? 3000 : currentPort + 1;
    console.log(`Port ${currentPort} is in use. Retrying on ${fallbackPort}...`);
    server.close(() => startServer(fallbackPort));
    return;
  }
  throw err;
});

startServer(DEFAULT_PORT);
