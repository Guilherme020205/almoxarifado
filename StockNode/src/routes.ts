import { Router } from "express";
import { Request, Response } from "express";

import { isAuthenticated } from "./middleware/isAuthenticated";

import { loginController } from "./controller/login/loginController";
import { createUserController } from "./controller/user/createUserController";
import { getUserController } from "./controller/user/getUsersController";
import { editUserController } from "./controller/user/editUserController";

const router = Router();

router.post("/login", new loginController().handle);

router.get("/user", isAuthenticated, new getUserController().handle);
router.post("/user", isAuthenticated, new createUserController().handle);
router.patch("/user/:id", isAuthenticated, new editUserController().handle);

router.get("/", (req: Request, res: Response) => {
  return res.json({ status: "Online" });
});

export default router;
