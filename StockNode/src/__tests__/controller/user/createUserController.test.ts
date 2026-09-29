import { Request, Response } from "express";
import { it, vi, describe, beforeEach, expect } from "vitest";
import { db } from "../../../prisma/db";
import { HttpError } from "../../../utils/httpError";
import { createUserController } from "../../../controller/user/createUserController";

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

function mockUser(overrides: Partial<{ active: boolean }> = {}) {
  return [
    {
      id: "user-1",
      name: "user 1",
      email: "email@gmail.com",
      profile: "ALMOXARIFE_CHEFE",
      password: "hashed",
      ...overrides,
    },
    {
      id: "user-2",
      name: "user 2",
      email: "email2@gmail.com",
      profile: "SUPERVISOR",
      password: "hashed",
      ...overrides,
    },
  ];
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
  it("não cria o usuario se faltar algum dado", async () => {});
  it("cria o usuario se o email ainda não cadastrado", async () => {});
  it("não cria o usuario se o email já está cadastrado", async () => {});
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
