import { Request, Response } from "express";

import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";
import {
  hashPassword,
  isEmailTaken,
  isValidEmailForProfile,
  normalizeEmail,
} from "../../utils/user";
import { PROFILES, type Profile } from "../../types";

// rota só exige login; quem pode editar quem é decidido aqui (depende do alvo)
class editUserController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, password, passwordConfirm, profile, active } =
      req.body;
    const requester = res.locals.user;

    if (typeof id !== "string" || !id) {
      throw new HttpError(400, "O ID enviado é inválido ou está malformado.");
    }

    if ([name, email, password, profile, active].every((v) => v === undefined)) {
      throw new HttpError(400, "Informe pelo menos um campo para atualizar.");
    }

    // typeof barra objeto/array/número no body
    if (
      (name !== undefined && (typeof name !== "string" || !name)) ||
      (email !== undefined && (typeof email !== "string" || !email)) ||
      (password !== undefined && (typeof password !== "string" || !password)) ||
      (active !== undefined && typeof active !== "boolean")
    ) {
      throw new HttpError(400, "Dados inválidos");
    }

    if (profile !== undefined && !PROFILES.includes(profile)) {
      throw new HttpError(400, "Perfil invalido");
    }

    if (password !== undefined && password !== passwordConfirm) {
      throw new HttpError(400, "Senhas diferentes");
    }

    const target = await db.orm.public.User.where({ id }).first();
    if (!target) {
      throw new HttpError(404, "Usuário não encontrado");
    }

    const isSelf = target.id === requester.sub;

    // qualquer perfil edita a própria conta; editar outra pessoa só ROOT/SUPERVISOR
    if (!isSelf && !["ROOT", "SUPERVISOR"].includes(requester.profile)) {
      throw new HttpError(403, "Sem permissão para editar outro usuário");
    }

    // o ROOT é da equipe de suporte: só muda pelo .env + seed, nunca pela API (nem por ele mesmo)
    if (target.profile === "ROOT") {
      throw new HttpError(403, "O usuário ROOT não pode ser editado pelo sistema");
    }

    // sem isso um AUXILIAR se promoveria a SUPERVISOR editando a si mesmo
    if (isSelf && profile !== undefined && profile !== target.profile) {
      throw new HttpError(403, "Não é permitido alterar o próprio perfil");
    }

    if (profile === "ROOT") {
      throw new HttpError(403, "Não é permitido promover usuário a ROOT");
    }

    if (active === false && isSelf) {
      throw new HttpError(403, "Não é permitido desativar o próprio usuário");
    }

    const finalProfile: Profile = profile ?? target.profile;
    const finalEmail = email !== undefined ? normalizeEmail(email) : target.email;

    if (
      (email !== undefined || profile !== undefined) &&
      !isValidEmailForProfile(finalProfile, finalEmail)
    ) {
      throw new HttpError(400, "Email invalido");
    }

    if (finalEmail !== target.email && (await isEmailTaken(finalEmail))) {
      throw new HttpError(409, "Email ja cadastrado");
    }

    // só manda pro banco o que veio no body
    const data: {
      name?: string;
      email?: string;
      password?: string;
      profile?: Profile;
      active?: boolean;
    } = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = finalEmail;
    if (password !== undefined) data.password = hashPassword(password);
    if (profile !== undefined) data.profile = profile;
    if (active !== undefined) data.active = active;

    await db.orm.public.User.where({ id }).update(data);

    res.status(200).json("Usuario atualizado");
  }
}

export { editUserController };
