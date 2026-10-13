import { Request, Response } from "express";

import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";
import {
  hashPassword,
  isEmailTaken,
  isValidEmailForProfile,
  normalizeEmail,
} from "../../utils/user";

import { PROFILES } from "../../types";

// permissão (ROOT/SUPERVISOR) é checada pelo requireProfile na rota
class createUserController {
  async handle(req: Request, res: Response) {
    const { name, password, profile } = req.body;

    // typeof barra objeto/array/número vindo no body (viraria 500 no hash ou no banco)
    if ([name, req.body.email, password, profile].some((v) => typeof v !== "string" || !v)) {
      throw new HttpError(400, "Dados faltantes");
    }

    const email = normalizeEmail(req.body.email);

    if (!PROFILES.includes(profile)) {
      throw new HttpError(400, "Perfil invalido");
    }
    // impossivel vir outra conta com "ROOT" não tera essa opção no front, mas por garantia...
    if (profile === "ROOT") {
      throw new HttpError(403, "Não é permitido criar usuário ROOT");
    }

    if (!isValidEmailForProfile(profile, email)) {
      throw new HttpError(400, "Email invalido");
    }

    // check-then-insert tem corrida; se duas requisições passarem juntas,
    // o @unique do banco barra e o handler do server.ts devolve 409
    if (await isEmailTaken(email)) {
      throw new HttpError(409, "Email ja cadastrado");
    }

    await db.orm.public.User.create({
      name: name,
      email: email,
      password: hashPassword(password),
      profile: profile,
    });

    res.status(201).json("Usuario criado");
  }
}

export { createUserController };
