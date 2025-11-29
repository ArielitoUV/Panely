import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();

// CORS TOTALMENTE ABIERTO (solo desarrollo)
app.use(cors({
  origin: "http://localhost:3000",  // tu Next.js
  credentials: true,
}));

app.use(express.json());

// Montamos las rutas en raíz
app.use("/", routes);

app.get("/health", (_, res) => res.json({ status: "auth-service OK" }));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Auth-service corriendo en http://localhost:${PORT}`);
  console.log(`CORS habilitado para http://localhost:3000`);
});