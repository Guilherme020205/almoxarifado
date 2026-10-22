import { describe, expect, it, vi, beforeEach } from "vitest";
import { Request, Response } from "express";

import { HttpError } from "../../../utils/httpError";

import { getTypeController } from "../../../controller/typeItem/getTypeController";

// imita o query builder: select() -> where()... -> all()
const query = vi.hoisted(() => ({ where: vi.fn(), all: vi.fn() }));

vi.mock("../../../prisma/db", () => ({
  db: { orm: { public: { TypeItem: { select: vi.fn(() => query) } } } },
}));

function mockReq(query: Partial<{ id: string; name: string; active: string }>) {
  return { query } as unknown as Request;
}

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function mockTypes() {
  return [
    { id: "type-1", name: "Papelaria", description: null, active: true },
    { id: "type-2", name: "Limpeza", description: null, active: true },
    { id: "type-3", name: "Informatica", description: null, active: false },
  ];
}

// executa o callback do where de índice `call` num tipo falso
// e devolve o mock do operador (eq/ilike) para conferir o argumento
function whereOp(call: number, field: string, op: "eq" | "ilike") {
  const fn = vi.fn();
  query.where.mock.calls[call][0]({ [field]: { [op]: fn } });
  return fn;
}

describe("getTypeController.handle", () => {
  const controller = new getTypeController();

  beforeEach(() => {
    vi.clearAllMocks();
    query.where.mockReturnValue(query);
  });

  it("Buscar todos os tipos", async () => {
    const types = mockTypes();
    query.all.mockResolvedValue(types);
    const res = mockRes();

    await controller.handle(mockReq({}), res);

    expect(query.where).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(types);
  });

  it("Buscar tipo por id", async () => {
    const types = [mockTypes()[0]];
    query.all.mockResolvedValue(types);
    const res = mockRes();

    await controller.handle(mockReq({ id: "type-1" }), res);

    expect(query.where).toHaveBeenCalledTimes(1);
    expect(whereOp(0, "id", "eq")).toHaveBeenCalledWith("type-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(types);
  });

  it("Buscar tipo por parte do nome", async () => {
    const types = [mockTypes()[0]];
    query.all.mockResolvedValue(types);
    const res = mockRes();

    await controller.handle(mockReq({ name: "pap" }), res);

    expect(query.where).toHaveBeenCalledTimes(1);
    expect(whereOp(0, "name", "ilike")).toHaveBeenCalledWith("%pap%");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(types);
  });

  it.each([
    ["true", true],
    ["false", false],
  ])("Buscar tipos com active=%s", async (active, expected) => {
    const types = mockTypes().filter((t) => t.active === expected);
    query.all.mockResolvedValue(types);
    const res = mockRes();

    await controller.handle(mockReq({ active }), res);

    expect(query.where).toHaveBeenCalledTimes(1);
    expect(whereOp(0, "active", "eq")).toHaveBeenCalledWith(expected);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(types);
  });

  it("Rejeitar active invalido", async () => {
    const res = mockRes();

    const err = await controller
      .handle(mockReq({ active: "sim" }), res)
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpError);
    expect(err).toMatchObject({
      statusCode: 400,
      message: "active deve ser true ou false",
    });
    expect(query.all).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("Combinar varios filtros", async () => {
    const types = [mockTypes()[0]];
    query.all.mockResolvedValue(types);
    const res = mockRes();

    await controller.handle(mockReq({ name: "pap", active: "true" }), res);

    expect(query.where).toHaveBeenCalledTimes(2);
    expect(whereOp(0, "name", "ilike")).toHaveBeenCalledWith("%pap%");
    expect(whereOp(1, "active", "eq")).toHaveBeenCalledWith(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(types);
  });
});
