import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "../../prisma/db";
import { verifyPassword } from "../../utils/user";
import { HttpError } from "../../utils/httpError";

class loginController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, "Email e senha são obrigatórios");
    }

    const user = await db.orm.public.User.where((u) =>
      u.email.eq(email),
    ).first();

    if (!user || !user.active || !verifyPassword(password, user.password)) {
      throw new HttpError(401, "Credenciais inválidas ou usuario inativo");
    }

    const token = jwt.sign(
      { sub: user.id, profile: user.profile },
      process.env["JWT_SECRET"]!,
      { expiresIn: "24h" },
    );

    res.status(200).json({ token });
  }
}

export { loginController };
