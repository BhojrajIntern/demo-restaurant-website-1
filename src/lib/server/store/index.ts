import "server-only";
import { fileStore } from "./file";
import { postgresStore } from "./postgres";
import type { Store } from "./types";

/** Postgres when DATABASE_URL is set, otherwise the JSON file in ./data. */
export function store(): Store {
  if (process.env.DATABASE_URL) return postgresStore;
  if (process.env.VERCEL) {
    // Serverless hosts can't keep files between requests — fail loudly instead of losing orders.
    throw new Error("DATABASE_URL is not set. On Vercel/serverless hosting a Postgres database is required (see DEPLOY.md).");
  }
  return fileStore;
}

export type { Store };
