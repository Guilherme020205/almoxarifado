import { db } from "./db";
import { hashPassword, ROOT_EMAIL, ROOT_PASSWORD } from "../utils/user";

async function main() {
  if (!ROOT_EMAIL || !ROOT_PASSWORD) {
    throw new Error("Defina rootuser e rootpass no .env");
  }

  // pode rodar de novo sem quebrar no @unique do email
  const existing = await db.orm.public.User.where({ email: ROOT_EMAIL }).first();
  if (existing) {
    console.log("ROOT já existe, nada a fazer.", existing.id);
    return;
  }

  const root = await db.orm.public.User.create({
    name: "Root",
    email: ROOT_EMAIL,
    password: hashPassword(ROOT_PASSWORD),
    profile: "ROOT",
  });

  console.log("Seed concluído.", root.id);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.close());
