import { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils/httpError";
import type { Profile } from "../types";

// usar depois do isAuthenticated, que preenche res.locals.user
export const requireProfile =
  (...profiles: Profile[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!profiles.includes(res.locals.user?.profile)) {
      throw new HttpError(403, "Sem permissão para esta ação");
    }
    next();
  };
