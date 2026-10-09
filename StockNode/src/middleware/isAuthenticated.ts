import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { HttpError } from "../utils/httpError";

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Token não informado");
  }

  try {
    // payload: { sub: user.id, profile: user.profile } (ver loginController)
    res.locals.user = jwt.verify(token, process.env["JWT_SECRET"]!);
  } catch {
    throw new HttpError(401, "Token inválido ou expirado");
  }

  next();
}
