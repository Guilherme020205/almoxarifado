import { describe, expect, it, vi } from "vitest";

// ROOT_EMAIL é lido do env na carga do módulo; não depende do .env local
vi.hoisted(() => {
  process.env["rootuser"] = "rootStocknode";
});

import {
  hashPassword,
  verifyPassword,
  isValidEmailForProfile,
} from "../../utils/user";

describe("login: verifyPassword", () => {
  it("aceita a senha correta", () => {
    const stored = hashPassword("minhaSenha123");
    expect(verifyPassword("minhaSenha123", stored)).toBe(true);
  });

  it("rejeita senha errada", () => {
    const stored = hashPassword("minhaSenha123");
    expect(verifyPassword("senhaErrada", stored)).toBe(false);
  });
});

describe("login: isValidEmailForProfile", () => {
  it("aceita e-mail do Root", () => {
    const email = "rootStocknode";
    expect(isValidEmailForProfile("ROOT", email)).toBe(true);
  });
  it("rejeita e-mail errado do Root", () => {
    const email = "emaildiferente@gmail.com";
    expect(isValidEmailForProfile("ROOT", email)).toBe(false);
  });
  it("aceita e-mail user normal", () => {
    const email = "email@gmail.com";
    expect(isValidEmailForProfile("ALMOXARIFE_CHEFE", email)).toBe(true);
  });
  it("rejeita e-mail sem @", () => {
    const emailErro = "emailgmail.com";
    expect(isValidEmailForProfile("ALMOXARIFE_CHEFE", emailErro)).toBe(false);
  });
  it("rejeita e-mail sem dominio", () => {
    const emailErro = "email@.com";
    expect(isValidEmailForProfile("ALMOXARIFE_CHEFE", emailErro)).toBe(false);
  });
  it("rejeita e-mail sem nome antes do @", () => {
    const emailErro = "@gmail.com";
    expect(isValidEmailForProfile("ALMOXARIFE_CHEFE", emailErro)).toBe(false);
  });
});
