import { Request, Response } from "express";
import { db } from "../../prisma/db";
import { HttpError } from "../../utils/httpError";

class createTypeController {
  async handle(req: Request, res: Response) {
    const {} = req.body;
  }
}

export { createTypeController };
