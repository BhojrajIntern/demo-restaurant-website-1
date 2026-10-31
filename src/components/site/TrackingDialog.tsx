"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, RequestError } from "@/lib/client";
import { rupee, type OrderMode } from "@/lib/pricing";
import type { OrderStatus, PublicOrder } from "@/lib/types";
import { CheckIcon, CloseIcon } from "../icons";
import { useShop, useUI } from "./store";

const STEPS: Record<OrderMode, [OrderStatus, string, string][]> = {
  delivery: [["new", "Order placed", "Waiting for the restaurant to accept"], ["accepted", "Accepted", "The kitchen has your order"], ["preparing", "Being prepared", "The tandoor is fired up"], ["out_for_delivery", "Out for delivery", "Your rider is on the way"], ["completed", "Delivered", "Enjoy your meal!"]],
  pickup: [["new", "Order placed", "Waiting for the restaurant to accept"], ["accepted", "Accepted", "The kitchen has your order"], ["preparing", "Being prepared", "The tandoor is fired up"], ["ready", "Ready for pickup", "Collect at the counter"], ["completed", "Picked up", "Enjoy your meal!"]],
};

/** Live order status — polls the server, which reflects what the manager sets in the dashboard. */
export function TrackingDialog({ id, token, mode, fresh }: { id: string; token: string; mode: OrderMode; fresh?: boolean }) {
  const [order, setOrder] = useState<PublicOrder | null>(null);
  const { setLastOrder } = useShop();
  const { closeDialog } = useUI();

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const o = await api<PublicOrder>("GET", `/api/orders/${encodeURIComponent(id)}?t=${encodeURIComponent(token)}`);
        if (!alive) return;
        setOrder(o);
        if (o.status === "completed" || o.status === "cancelled") {
          setLastOrder({ id, token, mode, done: true });
          return; // final state — stop polling
        }
      } catch (e) {
        if (e instanceof RequestError && e.status === 404) return; // unknown order (e.g. demo orders aren't saved) — nothing to poll
        /* otherwise keep trying */
      }
      if (alive) timer = setTimeout(poll, 4000);
    };
    poll();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [id, token, mode, setLastOrder]);

  const steps = STEPS[mode];
  const status = order?.status ?? "new";
  const idx = steps.findIndex((s) => s[0] === status);
  const cancelled = status === "cancelled";
  const title = cancelled ? "Order cancelled" : status === "completed" ? `Enjoy your meal, ${order?.name}!` : status !== "new" ? `Thanks, ${order?.name} — we're on it` : fresh ? "Order placed!" : "Your order";

  return (
    <div className="confirm">
      <div className="confirm-icon" style={cancelled ? { background: "rgba(192,57,43,.12)", color: "#c0392b" } : undefined}>
        {cancelled ? <CloseIcon /> : <CheckIcon />}
      </div>
      <h2>{title}</h2>
      <p style={{ color: "var(--text-dark-dim)", margin: 0 }} aria-live="polite">
        {cancelled ? (
          <>Sorry — the restaurant couldn&apos;t take this order{order?.cancelReason ? <>: <strong>{order.cancelReason}</strong>.</> : "."} You have not been charged.</>
        ) : status === "completed" ? "Thank you for ordering from Ember & Saffron." : "Sent straight to our kitchen. This page updates live."}
      </p>
      <div className="ref">#{id}</div>
      <ol className="track-steps">
        {steps.map(([key, a, b], i) => (
          <li key={key} className={cancelled ? "" : i <= idx ? "is-done" : i === idx + 1 ? "is-current" : ""}>
            <span className="dot">{!cancelled && i <= idx ? "✓" : i + 1}</span>
            <span><strong>{a}</strong><small>{b}</small></span>
          </li>
        ))}
      </ol>
      {order && (
        <div className="confirm-details">
          <div><span>Items</span><strong>{order.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</strong></div>
          <div><span>Total</span><strong>{rupee(order.totals.total)}</strong></div>
          <div><span>Type</span><strong>{order.mode === "delivery" ? "Delivery" : "Pickup"}</strong></div>
        </div>
      )}
      <div className="confirm-actions">
        <Link className="btn btn-dark" href="/menu" onClick={closeDialog}>Order something else</Link>
        <button className="btn btn-outline-dark" onClick={closeDialog}>Close</button>
      </div>
    </div>
  );
}
