/** Runs once when the Next.js server starts. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startupChecks } = await import("./lib/server/startup");
  startupChecks();
}
