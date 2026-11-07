import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { db } from "../prisma/db";
import { HttpError } from "../utils/httpError";

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Token não informado");
  }

  let payload: JwtPayload;
  try {
    // payload: { sub: user.id, profile: user.profile } (ver loginController)
    payload = jwt.verify(token, process.env["JWT_SECRET"]!) as JwtPayload;
  } catch {
    throw new HttpError(401, "Token inválido ou expirado");
  }

  // 1 query por requisição: desativação e troca de perfil valem na hora, sem esperar o token expirar
  const user = await db.orm.public.User.where({ id: payload.sub! }).first();
  if (!user || !user.active) {
    throw new HttpError(401, "Usuário inativo ou inexistente");
  }

  res.locals.user = { ...payload, profile: user.profile };
  next();
}
