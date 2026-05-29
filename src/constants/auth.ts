export const GLOBAL_ADMIN_EMAIL = "ean.aprovechamientotextil@gmail.com";

export function isGlobalAdminEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase() === GLOBAL_ADMIN_EMAIL;
}
