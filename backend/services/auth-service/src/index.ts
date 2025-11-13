import express from "express";
import cors from "cors";
import  prisma   from "./database";
import dotenv from "dotenv";
import path from "path";

// CARGA .env DESDE LA RAÍZ DEL PROYECTO (auth-service)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/test", async (req, res) => {
  const { mensaje } = req.body;

  if (!mensaje) {
    return res.status(400).json({ success: false, error: "Falta mensaje" });
  }

  try {
    const test = await prisma.test.create({
      data: { mensaje },
    });

    res.status(201).json({
      success: true,
      data: test,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.listen(PORT, () => {
  console.log(`Auth Service en http://localhost:${PORT}`);
  console.log(`Prueba: POST http://localhost:${PORT}/test`);
});