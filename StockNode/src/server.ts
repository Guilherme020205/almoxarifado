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
app.use(express.json());

app.use(cors());

app.use(router);

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is ruining on http://localhost:${port}`);
});
