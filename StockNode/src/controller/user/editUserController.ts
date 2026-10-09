import { Request, Response } from "express";

import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";
import { hashPassword } from "../../utils/user";

class editUserController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, password, passwordConfirm, profile, active } =
      req.body;

    if (!["ROOT", "SUPERVISOR"].includes(res.locals.user?.profile)) {
      throw new HttpError(403, "Sem permissão para editar usuário");
    }

    if (typeof id !== "string" || !id) {
      throw new HttpError(400, "O ID enviado é inválido ou está malformado.");
    }

    if (
      name === undefined &&
      email === undefined &&
      password === undefined &&
      passwordConfirm === undefined &&
      profile === undefined &&
      active === undefined
    ) {
      throw new HttpError(400, "Informe pelo menos um campo para atualizar.");
    }

    if (password === passwordConfirm) {
      throw new HttpError(400, "Senhas diferentes");
    }

    const user = await db.orm.public.User.where({ id: id }).update({
      name: name,
      email: email,
      password: hashPassword(password),
      profile: profile,
      active: active,
    });
  }
}

export { editUserController };
