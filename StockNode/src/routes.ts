import { Router } from "express";
import { Request, Response } from "express";
import { loginController } from "./controller/login/loginController";

const router = Router();

router.post("/login", new loginController().handle);

router.get("/", (req: Request, res: Response) => {
  return res.json({ status: "Online" });
});

export default router;
