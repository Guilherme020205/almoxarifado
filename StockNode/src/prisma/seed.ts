import { db } from "./db";
import { hashPassword, ROOT_EMAIL, ROOT_PASSWORD } from "../utils/user";

async function main() {
  if (!ROOT_EMAIL || !ROOT_PASSWORD) {
    throw new Error("Defina rootuser e rootpass no .env");
  }

  // o ROOT só é gerenciado por aqui: rodar de novo aplica o login/senha atuais do .env
  const existing = await db.orm.public.User.where({ profile: "ROOT" }).first();
  if (existing) {
    await db.orm.public.User.where({ id: existing.id }).update({
      email: ROOT_EMAIL,
      password: hashPassword(ROOT_PASSWORD),
      active: true,
    });
    console.log("ROOT atualizado com o .env.", existing.id);
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
