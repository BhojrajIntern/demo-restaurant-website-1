import { fmtTime } from "@/lib/hours";
import type { Order, OrderStatus } from "@/lib/types";

export const STATUS_LABEL: Record<string, string> = {
  new: "New", accepted: "Accepted", preparing: "Preparing", ready: "Ready for pickup", out_for_delivery: "Out for delivery",
  completed: "Completed", cancelled: "Cancelled", confirmed: "Confirmed", seated: "Seated", no_show: "No-show", contacted: "Contacted", closed: "Closed",
};

export type AdminOrder = Omit<Order, "token">;

/** The one-click "next step" for an order. */
export function nextStep(o: AdminOrder): [OrderStatus, string] | null {
  switch (o.status) {
    case "new": return ["accepted", "Accept order"];
    case "accepted": return ["preparing", "Start preparing"];
    case "preparing": return o.mode === "delivery" ? ["out_for_delivery", "Out for delivery"] : ["ready", "Ready for pickup"];
    case "ready": return ["completed", "Picked up"];
    case "out_for_delivery": return ["completed", "Delivered"];
    default: return null;
  }
}

export const CANCEL_REASONS = ["Item unavailable", "Kitchen too busy", "Outside delivery hours", "Customer requested", "Unable to reach customer"];

export const hm = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
export const minsAgo = (iso: string, now: number) => Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
export const agoText = (iso: string, now: number) => {
  const m = minsAgo(iso, now);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)} h ${m % 60} min ago`;
};

export function dayLabel(iso: string, today: string) {
  if (iso === today) return "Today";
  const t = new Date(today + "T00:00:00");
  t.setDate(t.getDate() + 1);
  const tomorrow = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  if (iso === tomorrow) return "Tomorrow";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export { fmtTime };

let audioCtx: AudioContext | null = null;
/** Three-note chime for new orders (browsers allow sound only after the manager has clicked something). */
export function chime() {
  try {
    const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
    audioCtx = audioCtx ?? new (window.AudioContext || W.webkitAudioContext!)();
    const ctx = audioCtx;
    [880, 1320, 880].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      const t = ctx.currentTime + i * 0.18;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.2);
    });
  } catch {
    /* audio unavailable */
  }
}

export function downloadCsv(name: string, rows: (string | number | null | undefined)[][]) {
  const body = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + body], { type: "text/csv" }));
  a.download = name;
  a.click();
}
