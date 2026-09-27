import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Profile } from "../types";
import { db } from "../prisma/db";

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const candidate = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(hash, "hex");
  return (
    candidate.length === expected.length && timingSafeEqual(candidate, expected)
  );
}

// Regra: o usuário ROOT é o único identificado por esse valor fixo (não é um
// email de verdade). Todo outro perfil precisa de um email real (user@dominio.tld).
export const ROOT_EMAIL = "rootStocknode";
const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailForProfile(
  profile: Profile,
  email: string,
): boolean {
  if (profile === "ROOT") return email === ROOT_EMAIL;
  return EMAIL_FORMAT.test(email);
}

export async function isEmailTaken(email: string): Promise<boolean> {
  const user = await db.orm.public.User.where((u) => u.email.eq(email)).first();
  return !!user;
}
