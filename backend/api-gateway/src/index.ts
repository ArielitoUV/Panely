// backend/api-gateway/src/index.ts
import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// ESTE PROXY FUNCIONA SIEMPRE
app.use("/api/auth", createProxyMiddleware({
  target: "http://localhost:3001",
  changeOrigin: true,
  pathRewrite: { "^/api/auth": "" }, // /api/auth/register → /register
  onProxyReq: (proxyReq, req, res) => {
    // ESTA ES LA CLAVE: enviar el body correctamente
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
      proxyReq.end(); // ← SIN ESTO SE QUEDA ESPERANDO
    }
  },
  onError: (err, req, res) => {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Error en gateway" });
  },
}));

app.get("/api/health", (req, res) => res.json({ status: "Gateway OK" }));

app.listen(8080, () => {
  console.log("API Gateway corriendo en http://localhost:8080");
  console.log("→ /api/auth/* → http://localhost:3001/*");
});