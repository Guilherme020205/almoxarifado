import { Router } from "express";
import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

import { isAuthenticated } from "./middleware/isAuthenticated";

import { loginController } from "./controller/login/loginController";
import { createUserController } from "./controller/user/createUserController";
import { getUserController } from "./controller/user/getUsersController";
import { editUserController } from "./controller/user/editUserController";

const router = Router();

// 10 tentativas por IP a cada 15 min
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

router.post("/login", loginLimiter, new loginController().handle);

router.get("/user", isAuthenticated, new getUserController().handle);
router.post("/user", isAuthenticated, new createUserController().handle);
router.patch("/user/:id", isAuthenticated, new editUserController().handle);

router.get("/", (req: Request, res: Response) => {
  return res.json({ status: "Online" });
});

export default router;
