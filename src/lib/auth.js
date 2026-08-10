export const ADMIN_EMAILS = [
  "abhyas2006@gmail.com",
  "nkeys.coofficial@gmail.com",
  "nkey.coofficial@gmail.com",
  "nkeys@gmail.com",
  "nkey@gmail.com"
];

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const isAdminEmail = (value) => {
  if (!value) return false;
  const norm = normalizeEmail(value);
  return ADMIN_EMAILS.some((e) => normalizeEmail(e) === norm);
};

export const isOwnerEmail = isAdminEmail;

export const roleFromEmail = (value) => (isAdminEmail(value) ? "admin" : "customer");
