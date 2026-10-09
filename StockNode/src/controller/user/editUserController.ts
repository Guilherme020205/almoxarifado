import { Request, Response } from "express";
import { db } from "../../prisma/db";
import { Profile } from "../../types";

class editUserController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, password, profile, active } = req.body;
  }
}

export { editUserController };
