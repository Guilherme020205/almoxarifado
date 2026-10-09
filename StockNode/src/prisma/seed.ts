import { db } from "./db";
import {
  hashPassword,
  isValidEmailForProfile,
  ROOT_EMAIL,
  ROOT_PASSWORD,
} from "../utils/user";

async function main() {
  if (
    !ROOT_EMAIL ||
    !isValidEmailForProfile("ROOT", ROOT_EMAIL)
  ) {
    throw new Error("Email do usuário ROOT inválido");
  }

  if (!ROOT_PASSWORD) {
    throw new Error("Senha do usuário ROOT inválido");
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
