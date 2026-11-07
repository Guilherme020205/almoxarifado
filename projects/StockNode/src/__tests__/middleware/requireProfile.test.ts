import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import { requireProfile } from "../../middleware/requireProfile";
import { HttpError } from "../../utils/httpError";

const run = (profile?: string) => {
  const res = { locals: { user: profile && { sub: "1", profile } } } as unknown as Response;
  const next = vi.fn();
  return { next, call: () => requireProfile("ROOT", "SUPERVISOR")({} as Request, res, next) };
};

describe("requireProfile", () => {
  it("deixa passar perfil permitido", () => {
    const { call, next } = run("SUPERVISOR");
    call();
    expect(next).toHaveBeenCalled();
  });

  it("barra perfil não permitido", () => {
    const { call, next } = run("ALMOXARIFE_CHEFE");
    expect(call).toThrow(HttpError);
    expect(next).not.toHaveBeenCalled();
  });

  it("barra quando não há usuário em res.locals", () => {
    expect(run().call).toThrow("Sem permissão para esta ação");
  });
});
