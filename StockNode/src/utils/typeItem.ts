import { db } from "../prisma/db";

// ilike sem % compara o nome inteiro ignorando maiúsculas ("Papelaria" = "papelaria");
// escapa \ % _ para não virarem curinga ("a_b" não pode bater com "axb")
export async function isTypeNameItemTaken(name: string): Promise<boolean> {
  const pattern = name.trim().replace(/[\%_]/g, "\$&");
  const typeItem = await db.orm.public.TypeItem.where((u) =>
    u.name.ilike(pattern),
  ).first();
  return !!typeItem;
}
