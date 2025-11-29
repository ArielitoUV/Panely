import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// CORS TOTALMENTE ABIERTO (solo desarrollo)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Proxy que funciona al 100%
app.use("/api/auth", createProxyMiddleware({
  target: "http://localhost:3001",
  changeOrigin: true,
  pathRewrite: { "^/api/auth": "" },
  onProxyReq: (proxyReq, req) => {
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end();
    }
  },
}));

app.get("/api/health", (_, res) => res.json({ status: "OK" }));

app.listen(8080, () => {
  console.log("Gateway corriendo en http://localhost:8080");
});