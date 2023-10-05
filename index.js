import "dotenv/config";
import express from "express";
import httpProxy from "http-proxy";
import path from "path";
import { fileURLToPath } from "url";
import wol from "./wol.js";

if (!process.env.REMOTE_MAC_ADDRESS) {
  throw new Error("REMOTE_MAC_ADDRESS is not defined");
}

if (!process.env.REMOTE_URL) {
  throw new Error("REMOTE_URL is not defined");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const proxy = httpProxy.createProxyServer({
  target: process.env.REMOTE_URL,
  changeOrigin: true,
  ws: true,
  proxyTimeout: 3000,
  timeout: 3000,
});

app.get("*", async (req, res) => {
  console.log(`${req.method} ${req.url} from ${req.ip}`);

  proxy.web(
    req,
    res,
    {
      hostRewrite: req.headers.host,
    },
    (err) => {
      console.log(err);
      wol(process.env.REMOTE_MAC_ADDRESS);
      res.status(503).sendFile(path.resolve(__dirname, "./error.html"));
    }
  );
});

const port = process.env.SERVER_PORT ? process.env.SERVER_PORT : 3000;
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

server.on("upgrade", function (req, socket, head) {
  proxy.ws(req, socket, head);
});
