import { describe, expect, it, vi, beforeEach } from "vitest";
import { Request, Response } from "express";

import { HttpError } from "../../../utils/httpError";

import { getUserController } from "../../../controller/user/getUsersController";

// imita o query builder: select() -> where()... -> all()
const query = vi.hoisted(() => ({ where: vi.fn(), all: vi.fn() }));

vi.mock("../../../prisma/db", () => ({
  db: { orm: { public: { User: { select: vi.fn(() => query) } } } },
}));

function mockReq(
  query: Partial<{
    id: string;
    name: string;
    email: string;
    profile: string;
    active: string;
  }>,
) {
  return { query } as unknown as Request;
}

function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function mockUser() {
  return [
    {
      id: "user-1",
      name: "user-1",
      email: "user-1@gmail.com",
      profile: "ALMOXARIFE_CHEFE",
      active: true,
    },
    {
      id: "user-2",
      name: "user-2",
      email: "user-2@gmail.com",
      profile: "ALMOXARIFE_CHEFE",
      active: true,
    },
    {
      id: "user-3",
      name: "user-3",
      email: "user-3@gmail.com",
      profile: "ALMOXARIFE_AUXILIAR",
      active: true,
    },
    {
      id: "user-4",
      name: "user-4",
      email: "user-4@gmail.com",
      profile: "SUPERVISOR",
      active: false,
    },
  ];
}

// executa o callback do where de índice `call` num usuário falso
// e devolve o mock do operador (eq/ilike/neq) para conferir o argumento
function whereOp(call: number, field: string, op: "eq" | "ilike" | "neq") {
  const fn = vi.fn();
  query.where.mock.calls[call][0]({ [field]: { [op]: fn } });
  return fn;
}

describe("getUserController.handle", () => {
  const controller = new getUserController();

  beforeEach(() => {
    vi.clearAllMocks();
    query.where.mockReturnValue(query);
  });

  it("Buscar todos os usuarios", async () => {
    const users = mockUser();
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(mockReq({}), res);

    expect(query.where).toHaveBeenCalledTimes(1);
    expect(whereOp(0, "profile", "neq")).toHaveBeenCalledWith("ROOT");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it("Buscar usuario por id", async () => {
    const users = [mockUser()[0]];
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(mockReq({ id: "user-1" }), res);

    expect(query.where).toHaveBeenCalledTimes(2);
    expect(whereOp(0, "id", "eq")).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it("Buscar usuario por nome", async () => {
    const users = [mockUser()[0]];
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(mockReq({ name: "user-1" }), res);

    expect(query.where).toHaveBeenCalledTimes(2);
    expect(whereOp(0, "name", "ilike")).toHaveBeenCalledWith("%user-1%");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it("Buscar usuario por email", async () => {
    const users = [mockUser()[1]];
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(mockReq({ email: "user-2@" }), res);

    expect(query.where).toHaveBeenCalledTimes(2);
    expect(whereOp(0, "email", "ilike")).toHaveBeenCalledWith("%user-2@%");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it("Buscar usuarios por perfil", async () => {
    const users = mockUser().slice(0, 2);
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(mockReq({ profile: "ALMOXARIFE_CHEFE" }), res);

    expect(query.where).toHaveBeenCalledTimes(2);
    expect(whereOp(0, "profile", "eq")).toHaveBeenCalledWith(
      "ALMOXARIFE_CHEFE",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it("Rejeitar perfil invalido", async () => {
    const res = mockRes();

    const err = await controller
      .handle(mockReq({ profile: "ADMIN" }), res)
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpError);
    expect(err).toMatchObject({ statusCode: 400, message: "Perfil invalido" });
    expect(query.all).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each([
    ["true", true],
    ["false", false],
  ])("Buscar usuarios com active=%s", async (active, expected) => {
    const users = mockUser().filter((u) => u.active === expected);
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(mockReq({ active }), res);

    expect(query.where).toHaveBeenCalledTimes(2);
    expect(whereOp(0, "active", "eq")).toHaveBeenCalledWith(expected);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
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
    const users = [mockUser()[0]];
    query.all.mockResolvedValue(users);
    const res = mockRes();

    await controller.handle(
      mockReq({ name: "user", profile: "ALMOXARIFE_CHEFE", active: "true" }),
      res,
    );

    expect(query.where).toHaveBeenCalledTimes(4);
    expect(whereOp(0, "name", "ilike")).toHaveBeenCalledWith("%user%");
    expect(whereOp(1, "profile", "eq")).toHaveBeenCalledWith(
      "ALMOXARIFE_CHEFE",
    );
    expect(whereOp(2, "active", "eq")).toHaveBeenCalledWith(true);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });
});
