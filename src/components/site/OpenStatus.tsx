"use client";
import { openStatus } from "@/lib/hours";
import { useNow } from "./hooks";

/** "Open now · until 11 pm" / "Closed · opens 7 pm today" in restaurant time (filled in after load). */
export function OpenStatus({ dot = true }: { dot?: boolean }) {
  const now = useNow();
  if (!now) return <span aria-hidden="true">&nbsp;</span>;
  const s = openStatus(now);
  return (
    <>
      {dot && <span className={`status-dot ${s.open ? "" : "closed"}`} style={{ display: "inline-block", marginRight: 8 }} />}
      {s.text}
    </>
  );
}
