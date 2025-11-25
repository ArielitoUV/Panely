// backend/services/auth-service/src/index.ts
import express from "express";
import cors from "cors";
import routes from "./routes";

const app = express();
app.use(cors());
app.use(express.json());

// MONTAR RUTAS EN RAÍZ
app.use("/", routes);

app.get("/health", (_, res) => res.json({ status: "OK" }));

app.listen(3001, () => {
  console.log("Auth-service en http://localhost:3001");
});