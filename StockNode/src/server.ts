import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import router from "./routes";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is ruining on http://localhost:${port}`);
});
