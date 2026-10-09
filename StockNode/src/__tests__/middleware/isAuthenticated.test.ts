import { describe, expect, it, vi, beforeAll } from "vitest";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { isAuthenticated } from "../../middleware/isAuthenticated";
import { HttpError } from "../../utils/httpError";

const run = (authorization?: string) => {
  const req = { headers: { authorization } } as Request;
  const res = { locals: {} } as Response;
  const next = vi.fn();
  return { res, next, call: () => isAuthenticated(req, res, next) };
};

describe("isAuthenticated", () => {
  beforeAll(() => {
    process.env["JWT_SECRET"] = "segredo-teste";
  });

  it("rejeita requisição sem token", () => {
    const { call, next } = run();
    expect(call).toThrow(HttpError);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejeita token inválido", () => {
    expect(run("Bearer lixo").call).toThrow("Token inválido ou expirado");
  });

  it("aceita token válido e expõe o payload em res.locals.user", () => {
    const token = jwt.sign({ sub: "1", profile: "ROOT" }, "segredo-teste");
    const { call, next, res } = run(`Bearer ${token}`);
    call();
    expect(next).toHaveBeenCalled();
    expect(res.locals.user).toMatchObject({ sub: "1", profile: "ROOT" });
  });
});
