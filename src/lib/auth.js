export const OWNER_EMAIL = "abhyas2006@gmail.com";

export const normalizeEmail = (value) => String(value || "").trim().toLowerCase();

export const isOwnerEmail = (value) => normalizeEmail(value) === OWNER_EMAIL;

export const roleFromEmail = (value) => (isOwnerEmail(value) ? "owner" : "customer");
