import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "../../prisma/db";
import { verifyPassword } from "../../utils/user";

class loginController {
  async handle(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email e senha são obrigatórios" });
    }

    try {
      const user = await db.orm.public.User.where((u) =>
        u.email.eq(email),
      ).first();

      if (!user || !user.active || !verifyPassword(password, user.password)) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign(
        { sub: user.id, profile: user.profile },
        process.env["JWT_SECRET"]!,
        { expiresIn: "24h" },
      );

      return res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: "Erro interno" });
    }
  }
}

export { loginController };
