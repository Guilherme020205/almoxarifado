import { Request, Response } from "express";
import { it, vi, describe, beforeEach, expect } from "vitest";

import { db } from "../../../prisma/db";
import { editUserController } from "../../../controller/user/editUserController";
import { isEmailTaken, verifyPassword } from "../../../utils/user";

// where({ id }) devolve { first, update }; cada teste escolhe o usuário alvo
const first = vi.fn();
const update = vi.fn();
vi.mock("../../../prisma/db", () => ({
  db: { orm: { public: { User: { where: vi.fn(() => ({ first, update })) } } } },
}));

vi.mock("../../../utils/user", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../utils/user")>()),
  isEmailTaken: vi.fn(),
}));

const alvo = (over = {}) => ({
  id: "2",
  email: "alvo@gmail.com",
  profile: "ALMOXARIFE_CHEFE",
  active: true,
  ...over,
});

function call(body: object, { id = "2", requester = "SUPERVISOR", sub = "1" } = {}) {
  const req = { params: { id }, body } as unknown as Request;
  const res = { locals: { user: { sub, profile: requester } } } as unknown as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return { res, promise: new editUserController().handle(req, res) };
}

describe("editUserController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    first.mockResolvedValue(alvo());
    vi.mocked(isEmailTaken).mockResolvedValue(false);
  });

  it("atualiza só os campos enviados", async () => {
    const { res, promise } = call({ name: "Novo" });
    await promise;
    expect(update).toHaveBeenCalledWith({ name: "Novo" });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("exige pelo menos um campo", async () => {
    await expect(call({}).promise).rejects.toMatchObject({ statusCode: 400 });
  });

  it("rejeita tipos errados", async () => {
    await expect(call({ active: "false" }).promise).rejects.toMatchObject({ statusCode: 400 });
  });

  it("exige confirmação de senha igual", async () => {
    await expect(
      call({ password: "a", passwordConfirm: "b" }).promise,
    ).rejects.toThrow("Senhas diferentes");
  });

  it("faz hash da senha", async () => {
    await call({ password: "nova", passwordConfirm: "nova" }, { requester: "ROOT" }).promise;
    const { password } = update.mock.calls[0][0];
    expect(verifyPassword("nova", password)).toBe(true);
  });

  it("404 se o usuário não existe", async () => {
    first.mockResolvedValue(null);
    await expect(call({ name: "x" }).promise).rejects.toMatchObject({ statusCode: 404 });
  });

  it("SUPERVISOR não edita o ROOT", async () => {
    first.mockResolvedValue(alvo({ profile: "ROOT" }));
    await expect(call({ name: "x" }).promise).rejects.toMatchObject({ statusCode: 403 });
  });

  it("ninguém promove alguém a ROOT", async () => {
    await expect(
      call({ profile: "ROOT" }, { requester: "ROOT" }).promise,
    ).rejects.toThrow("Não é permitido alterar o perfil ROOT");
  });

  it("não desativa o próprio usuário", async () => {
    first.mockResolvedValue(alvo({ id: "1" }));
    await expect(
      call({ active: false }, { id: "1", sub: "1" }).promise,
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("salva email novo em minúsculas e checa duplicado", async () => {
    await call({ email: "Novo@Gmail.com" }).promise;
    expect(isEmailTaken).toHaveBeenCalledWith("novo@gmail.com");
    expect(update).toHaveBeenCalledWith({ email: "novo@gmail.com" });
  });

  it("409 se o email novo já é de outro usuário", async () => {
    vi.mocked(isEmailTaken).mockResolvedValue(true);
    await expect(call({ email: "outro@gmail.com" }).promise).rejects.toMatchObject({ statusCode: 409 });
    expect(update).not.toHaveBeenCalled();
  });

  it("valida o email com o perfil final", async () => {
    await expect(call({ email: "semarroba" }).promise).rejects.toThrow("Email invalido");
  });

  it("AUXILIAR edita a própria conta", async () => {
    first.mockResolvedValue(alvo({ id: "1", profile: "ALMOXARIFE_AUXILIAR" }));
    await call({ name: "Eu" }, { id: "1", sub: "1", requester: "ALMOXARIFE_AUXILIAR" }).promise;
    expect(update).toHaveBeenCalledWith({ name: "Eu" });
  });

  it("AUXILIAR não edita outro usuário", async () => {
    await expect(
      call({ name: "x" }, { requester: "ALMOXARIFE_AUXILIAR" }).promise,
    ).rejects.toThrow("Sem permissão para editar outro usuário");
  });

  it("ninguém altera o próprio perfil", async () => {
    first.mockResolvedValue(alvo({ id: "1", profile: "ALMOXARIFE_AUXILIAR" }));
    await expect(
      call({ profile: "SUPERVISOR" }, { id: "1", sub: "1", requester: "ALMOXARIFE_AUXILIAR" }).promise,
    ).rejects.toThrow("Não é permitido alterar o próprio perfil");
    expect(update).not.toHaveBeenCalled();
  });

  it("SUPERVISOR troca a senha de outro usuário", async () => {
    await call({ password: "nova", passwordConfirm: "nova" }).promise;
    expect(update).toHaveBeenCalled();
  });

  it("SUPERVISOR troca a própria senha", async () => {
    first.mockResolvedValue(alvo({ id: "1", profile: "SUPERVISOR" }));
    await call({ password: "nova", passwordConfirm: "nova" }, { id: "1", sub: "1" }).promise;
    expect(update).toHaveBeenCalled();
  });

  it("SUPERVISOR altera o perfil de outro usuário", async () => {
    await call({ profile: "ALMOXARIFE_AUXILIAR" }).promise;
    expect(update).toHaveBeenCalledWith({ profile: "ALMOXARIFE_AUXILIAR" });
  });

  it("SUPERVISOR promove outro usuário a SUPERVISOR", async () => {
    await call({ profile: "SUPERVISOR" }).promise;
    expect(update).toHaveBeenCalledWith({ profile: "SUPERVISOR" });
  });

  it("ROOT não altera o próprio perfil", async () => {
    first.mockResolvedValue(alvo({ id: "1", profile: "ROOT", email: "rootstocknode" }));
    await expect(
      call({ profile: "SUPERVISOR" }, { id: "1", sub: "1", requester: "ROOT" }).promise,
    ).rejects.toMatchObject({ statusCode: 403 });
  });
});
