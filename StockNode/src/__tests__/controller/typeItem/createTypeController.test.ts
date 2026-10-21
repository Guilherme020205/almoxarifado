import { Request, Response } from "express";
import { it, vi, describe, beforeEach, expect } from "vitest";

import { db } from "../../../prisma/db";
import { createTypeController } from "../../../controller/typeItem/createTypeController";

// isTypeNameItemTaken roda de verdade: where(cb).first() decide se o nome existe
const first = vi.fn();
vi.mock("../../../prisma/db", () => ({
  db: {
    orm: {
      public: { TypeItem: { create: vi.fn(), where: vi.fn(() => ({ first })) } },
    },
  },
}));

function call(body: object) {
  const req = { body } as unknown as Request;
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return { res, promise: new createTypeController().handle(req, res) };
}

// executa o callback do where num tipo falso e devolve o padrão passado ao ilike
function ilikePattern() {
  const ilike = vi.fn();
  const where = db.orm.public.TypeItem.where as unknown as ReturnType<typeof vi.fn>;
  where.mock.calls[0][0]({ name: { ilike } });
  return ilike.mock.calls[0][0];
}

describe("createTypeController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    first.mockResolvedValue(null);
  });

  it("cria o tipo ativo, com nome e descrição sem espaços nas pontas", async () => {
    const { res, promise } = call({ name: " Papelaria ", description: " Folhas " });
    await promise;
    expect(db.orm.public.TypeItem.create).toHaveBeenCalledWith({
      name: "Papelaria",
      description: "Folhas",
      active: true,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("ignora active vindo no body", async () => {
    await call({ name: "Tinta", description: "x", active: false }).promise;
    expect(db.orm.public.TypeItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ active: true }),
    );
  });

  it.each([
    [{ description: "x" }],
    [{ name: "Tinta" }],
    [{ name: "   ", description: "x" }],
    [{ name: "Tinta", description: "   " }],
    [{ name: 123, description: "x" }],
    [{ name: ["Tinta"], description: "x" }],
  ])("400 com dados faltantes ou inválidos: %j", async (body) => {
    await expect(call(body).promise).rejects.toMatchObject({ statusCode: 400 });
    expect(db.orm.public.TypeItem.create).not.toHaveBeenCalled();
  });

  it("409 se o nome já existe", async () => {
    first.mockResolvedValue({ id: "1", name: "Papelaria" });
    await expect(
      call({ name: "papelaria", description: "x" }).promise,
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(db.orm.public.TypeItem.create).not.toHaveBeenCalled();
  });

  it("compara o nome inteiro, sem espaços nas pontas", async () => {
    await call({ name: " Papelaria ", description: "x" }).promise;
    expect(ilikePattern()).toBe("Papelaria");
  });

  it("escapa \\ % _ para não virarem curinga no ilike", async () => {
    await call({ name: "a_b%c\\d", description: "x" }).promise;
    expect(ilikePattern()).toBe("a\\_b\\%c\\\\d");
  });
});
