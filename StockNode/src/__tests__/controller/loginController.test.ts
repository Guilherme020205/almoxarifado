import { describe, expect, it, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";

import { loginController } from "../../controller/login/loginController";
import { db } from "../../prisma/db";
import { verifyPassword } from "../../utils/user";
import { HttpError } from "../../utils/httpError";
import jwt from "jsonwebtoken";

/**
 * Estratégia geral: loginController.handle tem 3 dependências externas
 * (banco, hash de senha, JWT) que não queremos executar de verdade num teste
 * unitário — nem existe DATABASE_URL de teste, nem faz sentido comparar hash
 * bcrypt ou validar assinatura JWT aqui. Por isso cada uma é substituída por
 * um mock (vi.mock) e o teste só verifica: "dado que o mock respondeu X, o
 * controller chamou res.status/json com Y, ou lançou o HttpError esperado".
 *
 * vi.mock(...) é "hoisted" pelo Vitest: roda antes de qualquer import no
 * arquivo, então quando loginController.ts faz `import { db } from
 * "../../prisma/db"`, ele já recebe a versão mockada abaixo — o código real
 * de db.ts (que chama postgres(...) com a URL do banco) nunca executa.
 */

// Substitui o client do ORM por um objeto com a mesma forma
// (db.orm.public.User.where(...).first()), mas cujo "where" é um vi.fn()
// que cada teste configura para devolver o usuário que quiser.
vi.mock("../../prisma/db", () => ({
  db: { orm: { public: { User: { where: vi.fn() } } } },
}));

// verifyPassword normalmente compara hash bcrypt; aqui viramos um mock para
// controlar diretamente se a "senha" deve ser aceita ou não em cada teste.
vi.mock("../../utils/user", () => ({
  verifyPassword: vi.fn(),
}));

// Não queremos gerar um JWT real (nem precisamos de JWT_SECRET válido).
// O mock devolve sempre "token-fake"; o teste de sucesso confere apenas
// que jwt.sign foi chamado com o payload/opções corretos.
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn(() => "token-fake") },
}));

// Fabrica um Request "fake" contendo só o que o controller lê: req.body.
function mockReq(body: Partial<{ email: string; password: string }>) {
  return { body } as Request;
}

// Fabrica um Response "fake". O controller chama res.status(200).json(...)
// (encadeado), então status() precisa retornar o próprio objeto res para
// que o .json() seguinte exista e possa ser espionado também.
function mockRes() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Usuário "de banco" padrão para os testes; cada teste sobrescreve só o
// campo que precisa mudar (active) via `overrides`.
function mockUser(overrides: Partial<{ active: boolean }> = {}) {
  return {
    id: "user-1",
    email: "email@gmail.com",
    profile: "ALMOXARIFE_CHEFE",
    active: true,
    password: "hashed",
    ...overrides,
  };
}

describe("loginController.handle", () => {
  const controller = new loginController();

  // Limpa histórico de chamadas e mockReturnValue/mockResolvedValue entre
  // testes, para um teste não "vazar" configuração de mock para o próximo.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // O controller faz `throw new HttpError(...)` dentro de um método async,
  // então esse throw vira uma Promise rejeitada — por isso usamos
  // `.rejects` em vez de um try/catch comum. toMatchObject compara apenas
  // statusCode e message do HttpError, ignorando o resto (stack, etc).
  it("rejeita quando falta email ou senha", async () => {
    const res = mockRes();
    await expect(
      controller.handle(mockReq({ password: "123" }), res),
    ).rejects.toMatchObject(
      new HttpError(400, "Email e senha são obrigatórios"),
    );
  });

  // No controller: `db.orm.public.User.where(fn).first()`. Reproduzimos
  // esse encadeamento fazendo `where` (o mock) devolver um objeto com
  // `.first()`, que por sua vez resolve para o "registro" que o teste
  // quer simular. Aqui: nenhum usuário encontrado (first -> null).
  it("rejeita quando usuario nao existe", async () => {
    vi.mocked(db.orm.public.User.where).mockReturnValue({
      first: vi.fn().mockResolvedValue(null),
    } as never);

    const res = mockRes();
    await expect(
      controller.handle(
        mockReq({ email: "x@gmail.com", password: "123" }),
        res,
      ),
    ).rejects.toMatchObject(
      new HttpError(401, "Credenciais inválidas ou usuario inativo"),
    );
  });

  // Usuário existe mas active: false. O controller trata "não existe" e
  // "está inativo" com o mesmo HttpError 401 (mensagem genérica de
  // segurança, pra não dar dica de qual parte falhou).
  it("rejeita quando usuario esta inativo", async () => {
    vi.mocked(db.orm.public.User.where).mockReturnValue({
      first: vi.fn().mockResolvedValue(mockUser({ active: false })),
    } as never);
    vi.mocked(verifyPassword).mockReturnValue(true);

    const res = mockRes();
    await expect(
      controller.handle(
        mockReq({ email: "email@gmail.com", password: "123" }),
        res,
      ),
    ).rejects.toMatchObject(
      new HttpError(401, "Credenciais inválidas ou usuario inativo"),
    );
  });

  // Usuário existe e está ativo, mas verifyPassword devolve false — mesmo
  // 401 genérico de novo.
  it("rejeita quando a senha esta errada", async () => {
    vi.mocked(db.orm.public.User.where).mockReturnValue({
      first: vi.fn().mockResolvedValue(mockUser()),
    } as never);
    vi.mocked(verifyPassword).mockReturnValue(false);

    const res = mockRes();
    await expect(
      controller.handle(
        mockReq({ email: "email@gmail.com", password: "errada" }),
        res,
      ),
    ).rejects.toMatchObject(
      new HttpError(401, "Credenciais inválidas ou usuario inativo"),
    );
  });

  // Caminho feliz: usuário existe, está ativo, senha confere. Aqui não
  // esperamos rejeição — chamamos `await controller.handle(...)` direto e
  // depois inspecionamos os mocks para confirmar o que o controller fez:
  // 1) chamou jwt.sign com o payload {sub, profile} e expiresIn "24h";
  // 2) respondeu HTTP 200 com { token: <retorno do jwt.sign mockado> }.
  it("retorna token quando credenciais sao validas", async () => {
    const user = mockUser();
    vi.mocked(db.orm.public.User.where).mockReturnValue({
      first: vi.fn().mockResolvedValue(user),
    } as never);
    vi.mocked(verifyPassword).mockReturnValue(true);

    const res = mockRes();
    await controller.handle(
      mockReq({ email: "email@gmail.com", password: "certa" }),
      res,
    );

    // O segundo argumento é o JWT_SECRET (process.env.JWT_SECRET!). No
    // ambiente de teste essa variável não está definida, então o valor
    // real passado é `undefined` — isso não quebra nada porque jwt.sign
    // está mockado e não valida o secret de verdade.
    expect(jwt.sign).toHaveBeenCalledWith(
      { sub: user.id, profile: user.profile },
      undefined,
      { expiresIn: "24h" },
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "token-fake" });
  });
});
