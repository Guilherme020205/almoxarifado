import { Response, Request } from "express";
import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";
import { PROFILES, type Profile } from "../../types";

class getUserController {
  async handle(req: Request, res: Response) {
    const { id, name, email, profile, active } = req.query;

    let query = db.orm.public.User.select(
      "id",
      "name",
      "email",
      "profile",
      "active",
    );

    if (typeof id === "string") {
      query = query.where((u) => u.id.eq(id));
    }

    if (typeof name === "string") {
      query = query.where((u) => u.name.ilike(`%${name}%`));
    }

    if (typeof email === "string") {
      query = query.where((u) => u.email.ilike(`%${email}%`));
    }

    if (profile !== undefined) {
      if (!PROFILES.includes(profile as Profile)) {
        throw new HttpError(400, "Perfil invalido");
      }
      query = query.where((u) => u.profile.eq(profile as Profile));
    }

    if (active !== undefined) {
      if (active !== "true" && active !== "false") {
        throw new HttpError(400, "active deve ser true ou false");
      }
      query = query.where((u) => u.active.eq(active === "true"));
    }

    // o ROOT é do suporte (RN27): nunca aparece na listagem, nem com ?profile=ROOT
    query = query.where((u) => u.profile.neq("ROOT"));

    const users = await query.all();

    res.status(200).json(users);
  }
}

export { getUserController };
