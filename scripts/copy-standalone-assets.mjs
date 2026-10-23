// Runs automatically after `npm run build` (npm "postbuild" hook).
// The standalone server (.next/standalone/server.js) needs public/ and .next/static/ next to it.
import { cpSync, existsSync } from "node:fs";

if (existsSync(".next/standalone")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
  cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
  console.log("✓ Copied public/ and .next/static/ into .next/standalone");
}
