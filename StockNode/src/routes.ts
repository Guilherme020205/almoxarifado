import { Router } from "express";
import { Request, Response } from "express";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  return res.json({ status: "Online" });
});

export default router;
