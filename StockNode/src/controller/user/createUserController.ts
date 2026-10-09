import { Request, Response } from "express";
import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";
import {
  hashPassword,
  isEmailTaken,
  isValidEmailForProfile,
} from "../../utils/user";

class createUserController {
  async handle(req: Request, res: Response) {
    // res.locals.user vem do middleware isAuthenticated
    if (!["ROOT", "SUPERVISOR"].includes(res.locals.user?.profile)) {
      throw new HttpError(403, "Sem permissão para criar usuários");
    }

    const { name, email, password, profile } = req.body;

    if (!name || !email || !password || !profile) {
      throw new HttpError(400, "Dados faltantes");
    }

    // impossivel vir outra conta com "ROOT" não tera essa opção no front, mas por garantia...
    if (profile === "ROOT") {
      throw new HttpError(403, "Não é permitido criar usuário ROOT");
    }

    if (!isValidEmailForProfile(profile, email)) {
      throw new HttpError(400, "Email invalido");
    }

    // check-then-insert tem corrida; o @unique do banco ainda barra, mas vira 500 nesse caso
    if (await isEmailTaken(email)) {
      throw new HttpError(409, "Email já cadastrado");
    }

    const user = await db.orm.public.User.create({
      name: name,
      email: email,
      password: hashPassword(password),
      profile: profile,
    });

    res.status(200).json("Usuario criado");
  }
}

export { createUserController };
