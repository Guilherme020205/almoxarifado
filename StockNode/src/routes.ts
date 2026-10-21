import { Router } from "express";
import { Request, Response } from "express";
import { rateLimit } from "express-rate-limit";

import { isAuthenticated } from "./middleware/isAuthenticated";
import { requireProfile } from "./middleware/requireProfile";

import { loginController } from "./controller/login/loginController";
import { createUserController } from "./controller/user/createUserController";
import { getUserController } from "./controller/user/getUsersController";
import { editUserController } from "./controller/user/editUserController";

import { createTypeController } from "./controller/typeItem/createTypeController";

const router = Router();

// 10 tentativas por IP a cada 15 min
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

router.post("/login", loginLimiter, new loginController().handle);

const permissionLevelOne = [
  isAuthenticated,
  requireProfile("ROOT", "SUPERVISOR"),
];

const permissionLevelTwo = [
  isAuthenticated,
  requireProfile("ROOT", "SUPERVISOR", "ALMOXARIFE_CHEFE"),
];

router.get("/user", isAuthenticated, new getUserController().handle);
router.post("/user", permissionLevelOne, new createUserController().handle);
router.patch("/user/:id", isAuthenticated, new editUserController().handle);

router.post("/typeitem", permissionLevelTwo, new createTypeController().handle);

router.get("/", (req: Request, res: Response) => {
  return res.json({ status: "Online" });
});

export default router;
