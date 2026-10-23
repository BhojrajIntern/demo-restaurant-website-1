/* Configuration checks printed once when the server starts. */
import { adminPassword } from "./auth";

export function startupChecks() {
  const prod = process.env.NODE_ENV === "production";
  const warn = (m: string) => console.warn(`\x1b[33m[config]\x1b[0m ${m}`);
  const db = process.env.DATABASE_URL ? "PostgreSQL" : "JSON file (data/db.json)";
  console.info(`[config] storage: ${db} · environment: ${process.env.NODE_ENV}`);
  if (!prod) return;
  if (!adminPassword()) warn("ADMIN_PASSWORD is missing, too short or the demo password — the manager dashboard is LOCKED until you set a strong one.");
  if (!process.env.NEXT_PUBLIC_SITE_URL) warn("NEXT_PUBLIC_SITE_URL is not set — sitemap, social previews and canonical links will point to localhost. Set it and rebuild.");
  if (!process.env.DATABASE_URL) warn("No DATABASE_URL: orders are stored in data/db.json. Make sure the data folder is on a persistent disk (Docker volume / VPS), or set DATABASE_URL.");
}
