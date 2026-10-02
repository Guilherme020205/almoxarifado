import { Request, Response } from "express";
import { it, vi, describe, beforeEach, expect } from "vitest";
import { db } from "../../../prisma/db";
import { HttpError } from "../../../utils/httpError";
import { createUserController } from "../../../controller/user/createUserController";
import { isEmailTaken } from "../../../utils/user";

vi.mock("../../../prisma/db", () => ({
  db: { orm: { public: { User: { create: vi.fn() } } } },
}));

// mocka só isEmailTaken; hashPassword e isValidEmailForProfile continuam reais
vi.mock("../../../utils/user", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../utils/user")>()),
  isEmailTaken: vi.fn(),
}));

function mockReq(
  body: Partial<{
    name: string;
    email: string;
    password: string;
    profile: string;
  }>,
) {
  return { body } as Request;
}

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("", () => {
  const controller = new createUserController();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("cria o usuario se todos os dados passados", async () => {
    const res = mockRes();
    await expect(
      controller.handle(
        mockReq({
          name: "guilherme",
          email: "guilherme@gmail.com",
          profile: "SUPERVISOR",
          password: "123",
        }),
        res,
      ),
    );
  });
  it("não cria o usuario se faltar algum dado", async () => {
    const res = mockRes();
    await expect(
      controller.handle(
        mockReq({
          email: "guilherme@gmail.com",
          profile: "SUPERVISOR",
          password: "123",
        }),
        res,
      ),
    ).rejects.toMatchObject(new HttpError(400, "Dados faltantes"));
  });
  it("cria o usuario se o email ainda não cadastrado", async () => {
    vi.mocked(isEmailTaken).mockResolvedValue(false);
    const res = mockRes();

    await controller.handle(
      mockReq({
        name: "guilherme",
        email: "guilherme@gmail.com",
        profile: "SUPERVISOR",
        password: "123",
      }),
      res,
    );

    expect(isEmailTaken).toHaveBeenCalledWith("guilherme@gmail.com");
    expect(db.orm.public.User.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: "guilherme@gmail.com" }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
  it("não cria o usuario se o email já está cadastrado", async () => {
    vi.mocked(isEmailTaken).mockResolvedValue(true);
    const res = mockRes();

    await expect(
      controller.handle(
        mockReq({
          name: "guilherme",
          email: "guilherme@gmail.com",
          profile: "SUPERVISOR",
          password: "123",
        }),
        res,
      ),
    ).rejects.toMatchObject(new HttpError(409, "Email já cadastrado"));
    expect(db.orm.public.User.create).not.toHaveBeenCalled();
  });
  it("não criar o usuario se o profile = 'ROOT'", async () => {
    const res = mockRes();
    await expect(
      controller.handle(
        mockReq({
          name: "gui",
          email: "guilherme@gmail.com",
          profile: "ROOT",
          password: "123",
        }),
        res,
      ),
    ).rejects.toMatchObject(
      new HttpError(403, "Não é permitido criar usuário ROOT"),
    );
  });
});
