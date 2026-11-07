import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./routes";
import { HttpError } from "./utils/httpError";

for (const name of ["JWT_SECRET", "DATABASE_URL"]) {
  if (!process.env[name]) {
    throw new Error(`Variável de ambiente ${name} não definida`);
  }
}

const app = express();

app.set("trust proxy", 1);

app.use(express.json());

// CORS_ORIGIN vazio = aceita qualquer origem (dev); em produção: "https://app.com,https://outro.com"
const corsOrigin = process.env["CORS_ORIGIN"];
app.use(cors(corsOrigin ? { origin: corsOrigin.split(",") } : undefined));

app.use(router);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  // 23505 = unique violation do Postgres (ex.: dois cadastros com o mesmo email ao mesmo tempo)
  if ((err as { sqlState?: string })?.sqlState === "23505") {
    return res.status(409).json({ message: "Registro já cadastrado" });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
