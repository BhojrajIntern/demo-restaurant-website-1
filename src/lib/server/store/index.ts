import "server-only";
import { fileStore } from "./file";
import { postgresStore } from "./postgres";
import { showcaseStore } from "./showcase";
import type { Store } from "./types";

/** Showcase mode (the default) saves nothing and shows sample data. Set SHOWCASE_MODE=false to store real data. */
export const showcaseMode = () => (process.env.SHOWCASE_MODE ?? "").trim().toLowerCase() !== "false";

/** Showcase store in demo mode; otherwise Postgres when DATABASE_URL is set, else the JSON file in ./data. */
export function store(): Store {
  if (showcaseMode()) return showcaseStore;
  if (process.env.DATABASE_URL) return postgresStore;
  if (process.env.VERCEL) {
    // Serverless hosts can't keep files between requests — fail loudly instead of losing orders.
    throw new Error("DATABASE_URL is not set. On Vercel/serverless hosting a Postgres database is required (see DEPLOY.md).");
  }
  return fileStore;
}

export type { Store };
