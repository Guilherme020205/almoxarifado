export const PROFILES = [
  "ROOT",
  "SUPERVISOR",
  "ALMOXARIFE_CHEFE",
  "ALMOXARIFE_AUXILIAR",
] as const;

export type Profile = (typeof PROFILES)[number];

export type OrderStatus = "PENDING" | "IN_FIELD" | "RETURNED" | "CANCELED";
