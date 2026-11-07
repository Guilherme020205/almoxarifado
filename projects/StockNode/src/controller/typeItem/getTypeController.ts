import { Request, Response } from "express";
import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";

class getTypeController {
  async handle(req: Request, res: Response) {
    const { id, name, active } = req.query;

    let query = db.orm.public.TypeItem.select(
      "id",
      "name",
      "description",
      "active",
      "updatedAt",
    );

    if (typeof id === "string") {
      query = query.where((u) => u.id.eq(id));
    }

    if (typeof name === "string") {
      query = query.where((u) => u.name.ilike(`%${name}%`));
    }

    if (active !== undefined) {
      if (active !== "true" && active !== "false") {
        throw new HttpError(400, "active deve ser true ou false");
      }
      query = query.where((u) => u.active.eq(active === "true"));
    }

    const typeItens = await query.all();

    res.status(200).json(typeItens);
  }
}

export { getTypeController };
