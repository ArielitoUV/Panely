import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const router = Router();

const authProxy = createProxyMiddleware({
  target: "http://localhost:3001",
  changeOrigin: true,
  pathRewrite: {
    "^/api/test": "/test",
  },
  onProxyReq: (proxyReq, req) => {
    if (req.body) {
      const body = JSON.stringify(req.body);
      proxyReq.setHeader("Content-Type", "application/json");
      proxyReq.setHeader("Content-Length", Buffer.byteLength(body));
      proxyReq.write(body);
    }
  },
});

router.post("/api/test", authProxy);

export default router;