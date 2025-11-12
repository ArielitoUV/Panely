import express from "express";
import cors from "cors";
import proxyRoutes from "./routes/proxy";

const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
app.use("/", proxyRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "api-gateway" });
});

app.listen(PORT, () => {
  console.log(`API Gateway en http://localhost:${PORT}`);
  console.log(`Prueba: POST http://localhost:${PORT}/api/test`);
});