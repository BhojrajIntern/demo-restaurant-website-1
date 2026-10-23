"use client";
import { useEffect, useRef, useState } from "react";
import { whenLabel } from "@/lib/hours";
import { rupee } from "@/lib/pricing";
import type { AdminActions } from "./AdminApp";
import { CANCEL_REASONS, hm, nextStep, STATUS_LABEL, type AdminOrder } from "./util";

/** Kitchen ticket for an 80 mm receipt printer (or any printer). */
function PrintTicket({ o }: { o: AdminOrder }) {
  return (
    <div id="print-ticket">
      <div style={{ textAlign: "center" }}><strong style={{ fontSize: 16 }}>EMBER &amp; SAFFRON</strong><br />KITCHEN TICKET</div>
      <hr />
      <strong style={{ fontSize: 18 }}>#{o.id}</strong> · {o.mode === "delivery" ? "DELIVERY" : "PICKUP"}<br />
      {new Date(o.created).toLocaleString("en-IN")}<br />Due: {whenLabel(o.when)}
      <hr />
      {o.items.map((i) => <div key={i.id + i.options}><strong>{i.qty} x {i.name}</strong>{i.options && <><br />&nbsp;&nbsp;{i.options}</>}</div>)}
      {o.note && <><hr /><strong>NOTE:</strong> {o.note}</>}
      <hr />{o.customer.name} · {o.customer.phone}<br />Total {rupee(o.totals.total)} · {o.payment}
    </div>
  );
}

export function OrderDrawer({ id, onClose, data, run }: { id: string | null; onClose: () => void } & AdminActions) {
  const o = data.orders.find((x) => x.id === id) ?? null;
  const [cancelOpen, setCancelOpen] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCancelOpen(false);
    if (!id) return;
    setTimeout(() => closeBtn.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [id, onClose]);

  const open = !!o;
  const n = o ? nextStep(o) : null;
  const t = o?.totals;
  const canCancel = o && !["completed", "cancelled"].includes(o.status);
  const first = o?.customer.name.split(" ")[0] ?? "";

  return (
    <>
      <div className={`scrim ${open ? "is-open" : ""}`} onClick={onClose} />
      <aside className={`drawer order-drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="od-title" aria-hidden={!open}>
        {o && t && (
          <>
            <div className="drawer-head">
              <h2 id="od-title">#{o.id} <span className={`pill ${o.status}`} style={{ verticalAlign: "middle", fontFamily: "var(--sans)" }}>{STATUS_LABEL[o.status]}</span></h2>
              <button ref={closeBtn} className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
            </div>
            <div className="drawer-body">
              <div className="od-section">
                <h3>Customer</h3>
                <strong style={{ fontSize: 17 }}>{o.customer.name}</strong>
                <div style={{ color: "var(--text-dark-dim)", fontSize: 14 }}>+91 {o.customer.phone}{o.customer.whatsapp ? " · wants WhatsApp updates" : ""}</div>
                <div className="od-contact">
                  <a className="mini" href={`tel:+91${o.customer.phone}`} style={{ display: "inline-flex", alignItems: "center" }}>📞 Call</a>
                  <a className="mini" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center" }}
                    href={`https://wa.me/91${o.customer.phone}?text=${encodeURIComponent(`Hi ${first}, this is Ember & Saffron about your order #${o.id}.`)}`}>💬 WhatsApp</a>
                </div>
              </div>
              <div className="od-section">
                <h3>{o.mode === "delivery" ? "Delivery" : "Pickup"} · {whenLabel(o.when)}</h3>
                {o.mode === "delivery" ? <div>{o.address}<br /><strong>{o.pincode}</strong></div> : <div>Customer collects at the counter</div>}
                <div style={{ marginTop: 6, color: "var(--text-dark-dim)", fontSize: 14 }}>Payment: <strong style={{ color: "var(--text-dark)" }}>{o.payment}</strong> {o.paid ? "(payment collected)" : "(collect on handover)"}</div>
              </div>
              {o.note && <div className="od-section"><h3>Kitchen note</h3><div className="od-note">📝 {o.note}</div></div>}
              <div className="od-section">
                <h3>Items</h3>
                {o.items.map((i) => (
                  <div className="od-line" key={i.id + i.options}>
                    <span className="q">{i.qty}×</span>
                    <span style={{ flex: 1 }}>{i.name} {i.veg ? "🟢" : "🔺"}{i.options && <small>{i.options}</small>}</span>
                    <span>{rupee(i.line)}</span>
                  </div>
                ))}
                <div className="totals" style={{ marginTop: 12 }}>
                  <div><span>Subtotal</span><span>{rupee(t.subtotal)}</span></div>
                  {t.discount > 0 && <div className="discount"><span>Discount ({o.coupon})</span><span>−{rupee(t.discount)}</span></div>}
                  {o.mode === "delivery" && <div><span>Delivery</span><span>{t.delivery ? rupee(t.delivery) : "Free"}</span></div>}
                  <div><span>Packaging</span><span>{rupee(t.packaging)}</span></div>
                  <div><span>GST</span><span>{rupee(t.gst)}</span></div>
                  <div className="grand"><span>Total</span><span>{rupee(t.total)}</span></div>
                </div>
              </div>
              <div className="od-section">
                <h3>Timeline</h3>
                <ul className="timeline">{o.history.map((h, i) => <li key={i}><span>{STATUS_LABEL[h.status]}</span><span>{hm(h.at)}</span></li>)}</ul>
                {o.status === "cancelled" && o.cancelReason && <p style={{ margin: "10px 0 0", color: "#b23a2a", fontSize: 14 }}>Reason: {o.cancelReason}</p>}
              </div>
            </div>
            <div className="drawer-foot">
              <div className="od-actions">
                {n && <button className="btn btn-ember btn-block" onClick={() => run("PATCH", `/api/admin/orders/${o.id}`, { status: n[0] }, `#${o.id} → ${STATUS_LABEL[n[0]]}`)}>{n[1]}</button>}
                <div className="row">
                  <button className="btn btn-sm btn-outline-dark" onClick={() => window.print()}>🖨 Print kitchen ticket</button>
                  {canCancel && <button className="btn btn-sm btn-outline-dark" style={{ color: "#b23a2a" }} onClick={() => setCancelOpen((c) => !c)}>{o.status === "new" ? "Reject" : "Cancel"} order</button>}
                </div>
                {canCancel && cancelOpen && (
                  <div>
                    <p style={{ margin: "6px 0", fontSize: 13, fontWeight: 800 }}>Reason (shown to the customer):</p>
                    <div className="chips">
                      {CANCEL_REASONS.map((r) => (
                        <button key={r} type="button" className="chip" onClick={() => {
                          if (confirm(`Cancel order #${o.id}? The customer will see: "${r}"`)) run("PATCH", `/api/admin/orders/${o.id}`, { status: "cancelled", reason: r }, `#${o.id} cancelled`);
                        }}>{r}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <PrintTicket o={o} />
          </>
        )}
      </aside>
    </>
  );
}
