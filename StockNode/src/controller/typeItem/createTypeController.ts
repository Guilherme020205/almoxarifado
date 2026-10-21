import { Request, Response } from "express";
import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";
import { isTypeNameItemTaken } from "../../utils/typeItem";

class createTypeController {
  async handle(req: Request, res: Response) {
    const { name, description, active } = req.body;

    // trim barra string só com espaços ("   ") passando como preenchida
    if ([name, description].some((v) => typeof v !== "string" || !v.trim())) {
      throw new HttpError(400, "Dados faltantes");
    }

    // active é opcional (default true no banco), mas se vier tem que ser boolean
    if (active !== undefined && typeof active !== "boolean") {
      throw new HttpError(400, "active deve ser true ou false");
    }

    if (await isTypeNameItemTaken(name)) {
      throw new HttpError(409, "nome do tipo já cadastrado");
    }

    await db.orm.public.TypeItem.create({
      name: name.trim(),
      description: description.trim(),
      active: active,
    });

    res.status(201).json("Tipo de item criado");
  }
}

export { createTypeController };
