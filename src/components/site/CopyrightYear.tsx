"use client";
import { useNow } from "./hooks";

/** Current year, filled in after load (keeps the footer prerenderable). */
export function CopyrightYear() {
  const now = useNow(24 * 60 * 60 * 1000);
  return <>{now ? now.getFullYear() : "2026"}</>;
}
