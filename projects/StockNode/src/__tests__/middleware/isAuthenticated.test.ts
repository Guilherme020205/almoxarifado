import { describe, expect, it, vi, beforeAll, beforeEach } from "vitest";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "../../prisma/db";
import { isAuthenticated } from "../../middleware/isAuthenticated";
import { HttpError } from "../../utils/httpError";

const first = vi.fn();
vi.mock("../../prisma/db", () => ({
  db: { orm: { public: { User: { where: vi.fn(() => ({ first })) } } } },
}));

const run = (authorization?: string) => {
  const req = { headers: { authorization } } as Request;
  const res = { locals: {} } as Response;
  const next = vi.fn();
  return { res, next, call: () => isAuthenticated(req, res, next) };
};

const validToken = () =>
  `Bearer ${jwt.sign({ sub: "1", profile: "ROOT" }, "segredo-teste")}`;

describe("isAuthenticated", () => {
  beforeAll(() => {
    process.env["JWT_SECRET"] = "segredo-teste";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita requisição sem token", async () => {
    const { call, next } = run();
    await expect(call()).rejects.toThrow(HttpError);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita token inválido", async () => {
    await expect(run("Bearer lixo").call()).rejects.toThrow(
      "Token inválido ou expirado",
    );
  });

  it("aceita token válido de usuário ativo e expõe o payload em res.locals.user", async () => {
    first.mockResolvedValue({ id: "1", active: true, profile: "ROOT" });
    const { call, next, res } = run(validToken());
    await call();
    expect(db.orm.public.User.where).toHaveBeenCalledWith({ id: "1" });
    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toMatchObject({ sub: "1", profile: "ROOT" });
  });

  it("rejeita token válido de usuário desativado", async () => {
    first.mockResolvedValue({ id: "1", active: false, profile: "ROOT" });
    const { call, next } = run(validToken());
    await expect(call()).rejects.toThrow("Usuário inativo ou inexistente");
    expect(next).not.toHaveBeenCalled();
  });

  it("usa o perfil atual do banco, não o do token", async () => {
    first.mockResolvedValue({ id: "1", active: true, profile: "SUPERVISOR" });
    const { call, res } = run(validToken());
    await call();
    expect(res.locals.user.profile).toBe("SUPERVISOR");
  });
});
