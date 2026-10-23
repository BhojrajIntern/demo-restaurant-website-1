"use client";
import { useState } from "react";
import { categories } from "@/lib/data";
import { addDays } from "@/lib/hours";
import { rupee } from "@/lib/pricing";
import { whenLabel } from "@/lib/hours";
import type { AdminActions } from "./AdminApp";
import { agoText, dayLabel, downloadCsv, fmtTime, hm, minsAgo, nextStep, STATUS_LABEL, type AdminOrder } from "./util";

const ACTIVE = ["new", "accepted", "preparing", "ready", "out_for_delivery"];
const Pill = ({ s }: { s: string }) => <span className={`pill ${s}`}>{STATUS_LABEL[s]}</span>;

/* ------------------------------------------------------------------ dashboard */
export function DashboardView({ data, now, openOrder, go }: AdminActions) {
  const s = data.stats;
  const attention = data.orders.filter((o) => ACTIVE.includes(o.status)).slice(0, 6);
  const upcoming = data.reservations.filter((r) => (r.date >= data.today && r.status === "confirmed") || (r.date === data.today && r.status === "seated")).slice(0, 6);
  const counts: Record<string, number> = {};
  data.orders.filter((o) => o.created.startsWith(data.today) && o.status !== "cancelled").forEach((o) => o.items.forEach((i) => (counts[i.name] = (counts[i.name] ?? 0) + i.qty)));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = top[0]?.[1] ?? 1;

  return (
    <section className="view">
      <div className="kpis">
        <div className={`kpi ${s.newOrders ? "alert" : ""}`}><span>New orders waiting</span><strong>{s.newOrders}</strong><small>{s.activeOrders} in progress</small></div>
        <div className="kpi"><span>Orders today</span><strong>{s.ordersToday}</strong><small>avg {rupee(s.avgOrder)}</small></div>
        <div className="kpi"><span>Revenue today</span><strong>{rupee(s.revenueToday)}</strong><small>excl. cancelled</small></div>
        <div className="kpi"><span>Bookings today</span><strong>{s.bookingsToday}</strong><small>{s.coversToday} guests</small></div>
        <div className="kpi"><span>New enquiries</span><strong>{s.newEnquiries}</strong><small>{s.subscribers} subscriber{s.subscribers === 1 ? "" : "s"}</small></div>
      </div>
      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head"><h2>Needs attention</h2><button className="link" onClick={() => go("orders")}>All orders →</button></div>
          {attention.length ? attention.map((o) => (
            <button className="row-item" key={o.id} onClick={() => openOrder(o.id)} style={{ width: "100%", textAlign: "left" }}>
              <Pill s={o.status} />
              <div className="grow"><strong>#{o.id} · {o.customer.name}</strong><small>{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</small></div>
              <span>{rupee(o.totals.total)}</span>
            </button>
          )) : <div className="empty">All caught up — no open orders. 🎉</div>}
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Upcoming reservations</h2><button className="link" onClick={() => go("reservations")}>All bookings →</button></div>
          {upcoming.length ? upcoming.map((r) => (
            <button className="row-item" key={r.id} onClick={() => go("reservations", r.date)} style={{ width: "100%", textAlign: "left" }}>
              <span className="time">{dayLabel(r.date, data.today)}<small style={{ display: "block", fontWeight: 600, color: "var(--text-dark-dim)" }}>{fmtTime(r.time)}</small></span>
              <div className="grow"><strong>{r.name} · {r.party} guests</strong><small>{[r.seating, r.occasion, r.notes].filter(Boolean).join(" · ")}</small></div>
              <Pill s={r.status} />
            </button>
          )) : <div className="empty">No upcoming bookings yet.</div>}
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Best sellers today</h2></div>
          {top.length ? top.map(([n, q]) => (
            <div className="bar-row" key={n}><span>{n}</span><span className="bar"><i style={{ width: `${(q / max) * 100}%` }} /></span><strong>{q}</strong></div>
          )) : <div className="empty">No orders yet today.</div>}
        </div>
        <div className="panel">
          <div className="panel-head"><h2>Latest enquiries</h2><button className="link" onClick={() => go("enquiries")}>All enquiries →</button></div>
          {data.enquiries.length ? data.enquiries.slice(0, 5).map((e) => (
            <div className="row-item" key={e.id}>
              <Pill s={e.status} />
              <div className="grow"><strong>{e.kind === "event" ? `${e.eventType} · ${e.guests} guests` : `Gift card · ${rupee(e.amount ?? 0)}`}</strong><small>{e.name} · {e.email}</small></div>
              <small>{agoText(e.created, now)}</small>
            </div>
          )) : <div className="empty">No enquiries yet.</div>}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ orders */
function OrderCard({ o, now, fresh, run, openOrder }: { o: AdminOrder } & Pick<AdminActions, "now" | "fresh" | "run" | "openOrder">) {
  const n = nextStep(o);
  const late = o.status === "new" && minsAgo(o.created, now) >= 5;
  return (
    <article className={`ocard ${fresh.has(o.id) ? "is-fresh" : ""}`} onClick={() => openOrder(o.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && openOrder(o.id)} aria-label={`Order ${o.id} from ${o.customer.name}`}>
      <div className="ocard-top"><strong>#{o.id}</strong><span className={`ago ${late ? "late" : ""}`}>{late ? "⚠ " : ""}{agoText(o.created, now)}</span></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        <span className="pill mode">{o.mode === "delivery" ? "🛵 Delivery" : "🛍 Pickup"}</span>
        <span className="pill mode">{whenLabel(o.when)}</span>
        {o.paid && <span className="pill completed">Paid</span>}
      </div>
      <div className="who">{o.customer.name}</div>
      <div className="items">{o.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</div>
      {o.note && <div className="note">📝 {o.note}</div>}
      <div className="ocard-foot">
        <span className="total">{rupee(o.totals.total)}</span>
        {n && (
          <button className={`btn btn-sm ${o.status === "new" ? "btn-ember" : "btn-dark"}`}
            onClick={(e) => { e.stopPropagation(); run("PATCH", `/api/admin/orders/${o.id}`, { status: n[0] }, `#${o.id} → ${STATUS_LABEL[n[0]]}`); }}>
            {n[1]}
          </button>
        )}
      </div>
    </article>
  );
}

export function OrdersView(a: AdminActions) {
  const { data, openOrder } = a;
  const [tab, setTab] = useState<"board" | "history">("board");
  const [q, setQ] = useState("");
  const list = data.orders.filter((o) => !q.trim() || [o.id, o.customer.name, o.customer.phone, o.address, o.pincode].join(" ").toLowerCase().includes(q.trim().toLowerCase()));
  const cols: [string, (o: AdminOrder) => boolean, string][] = [
    ["New", (o) => o.status === "new", "new-col"],
    ["Accepted", (o) => o.status === "accepted", ""],
    ["In the kitchen", (o) => o.status === "preparing", ""],
    ["Ready / on the way", (o) => o.status === "ready" || o.status === "out_for_delivery", ""],
  ];
  const exportCsv = () => downloadCsv(`orders-${data.today}.csv`, [
    ["Order", "Placed", "Status", "Type", "Customer", "Phone", "Address", "Pincode", "Items", "Subtotal", "Discount", "Delivery", "Packaging", "GST", "Total", "Payment"],
    ...data.orders.map((o) => [o.id, o.created, STATUS_LABEL[o.status], o.mode, o.customer.name, o.customer.phone, o.address, o.pincode,
      o.items.map((i) => `${i.qty}x ${i.name}${i.options ? ` (${i.options})` : ""}`).join("; "), o.totals.subtotal, o.totals.discount, o.totals.delivery, o.totals.packaging, o.totals.gst, o.totals.total, o.payment]),
  ]);

  return (
    <section className="view">
      <div className="toolbar">
        <div className="seg-tabs" role="tablist">
          <button className={tab === "board" ? "is-active" : ""} onClick={() => setTab("board")}>Live board</button>
          <button className={tab === "history" ? "is-active" : ""} onClick={() => setTab("history")}>History</button>
        </div>
        <div className="toolbar-right">
          <input className="input sm" type="search" placeholder="Search order #, name, phone…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
          <button className="btn btn-sm btn-outline-dark" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      {tab === "board" ? (
        <div className="board">
          {cols.map(([title, fn, cls]) => {
            const items = list.filter(fn).sort((x, y) => x.created.localeCompare(y.created));
            return (
              <div className={`col ${cls}`} key={title}>
                <div className="col-head">{title}<span>{items.length}</span></div>
                {items.length ? items.map((o) => <OrderCard key={o.id} o={o} {...a} />) : <div className="empty">Nothing here</div>}
              </div>
            );
          })}
        </div>
      ) : list.length ? (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th>Items</th><th>Type</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="clickable" onClick={() => openOrder(o.id)}>
                  <td><strong>#{o.id}</strong></td>
                  <td>{new Date(o.created).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}<small>{hm(o.created)}</small></td>
                  <td>{o.customer.name}<small>{o.customer.phone}</small></td>
                  <td>{o.items.reduce((x, i) => x + i.qty, 0)} items<small>{o.items.slice(0, 2).map((i) => i.name).join(", ")}{o.items.length > 2 ? "…" : ""}</small></td>
                  <td>{o.mode === "delivery" ? "Delivery" : "Pickup"}</td>
                  <td><strong>{rupee(o.totals.total)}</strong></td>
                  <td><Pill s={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">No orders yet. Place one on the website — it will appear here within a few seconds.</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ reservations */
export function ReservationsView({ data, run, resDate, setResDate }: AdminActions) {
  const day = resDate || data.today;
  const list = data.reservations.filter((r) => r.date === day);
  const live = list.filter((r) => r.status !== "cancelled");
  const upcoming: Record<string, number> = {};
  data.reservations.filter((r) => r.date >= data.today && r.status === "confirmed").forEach((r) => (upcoming[r.date] = (upcoming[r.date] ?? 0) + 1));
  const days = Object.keys(upcoming).sort().slice(0, 10);
  const bySlot: Record<string, typeof list> = {};
  list.forEach((r) => (bySlot[r.time] ??= []).push(r));
  const act = (id: string, status: string) => run("PATCH", `/api/admin/reservations/${id}`, { status }, `Booking ${id} → ${STATUS_LABEL[status]}`);

  return (
    <section className="view">
      <div className="toolbar">
        <div className="date-nav">
          <button className="btn btn-sm btn-outline-dark" onClick={() => setResDate(addDays(day, -1))} aria-label="Previous day">←</button>
          <input className="input sm" type="date" value={day} onChange={(e) => setResDate(e.target.value)} aria-label="Date" />
          <button className="btn btn-sm btn-outline-dark" onClick={() => setResDate(addDays(day, 1))} aria-label="Next day">→</button>
          <button className="btn btn-sm btn-outline-dark" onClick={() => setResDate(data.today)}>Today</button>
        </div>
        <div className="res-summary">
          <span>{live.length} bookings</span><span>{live.reduce((x, r) => x + r.party, 0)} guests</span><span>{list.filter((r) => r.status === "seated").length} seated</span>
        </div>
      </div>
      {days.length > 0 && (
        <div className="chips" style={{ marginBottom: 18 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-dark-dim)", alignSelf: "center", marginRight: 4 }}>Upcoming:</span>
          {days.map((d) => <button key={d} className={`chip ${d === day ? "is-selected" : ""}`} onClick={() => setResDate(d)}>{dayLabel(d, data.today)} · {upcoming[d]}</button>)}
        </div>
      )}
      {!list.length ? (
        <div className="empty">No reservations for {new Date(day + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}.</div>
      ) : Object.keys(bySlot).sort().map((t) => (
        <div className="res-slot" key={t}>
          <h3>{fmtTime(t)} · {bySlot[t].filter((r) => r.status !== "cancelled").reduce((x, r) => x + r.party, 0)} guests</h3>
          {bySlot[t].map((r) => (
            <div className={`res-card is-${r.status}`} key={r.id}>
              <div><span className="name">{r.name}</span><small>+91 {r.phone}{r.email ? ` · ${r.email}` : ""} · #{r.id}</small></div>
              <div><strong>{r.party}</strong> guests<small>{r.seating}</small></div>
              <div>{r.occasion && <>🎉 {r.occasion}</>}<small><Pill s={r.status} /></small></div>
              <div className="actions">
                {r.status === "confirmed" && <>
                  <button className="mini primary" onClick={() => act(r.id, "seated")}>Seat</button>
                  <button className="mini" onClick={() => act(r.id, "no_show")}>No-show</button>
                  <button className="mini danger" onClick={() => act(r.id, "cancelled")}>Cancel</button>
                </>}
                {r.status === "seated" && <button className="mini primary" onClick={() => act(r.id, "completed")}>Finished</button>}
                {["cancelled", "no_show", "completed"].includes(r.status) && <button className="mini" onClick={() => act(r.id, "confirmed")}>Undo</button>}
              </div>
              {r.notes && <div className="notes">📝 {r.notes}</div>}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ enquiries */
export function EnquiriesView({ data, now, run }: AdminActions) {
  const [tab, setTab] = useState<"all" | "event" | "giftcard">("all");
  const list = data.enquiries.filter((e) => tab === "all" || e.kind === tab);
  const act = (id: string, status: string) => run("PATCH", `/api/admin/enquiries/${id}`, { status }, `Enquiry ${id} → ${STATUS_LABEL[status]}`);
  return (
    <section className="view">
      <div className="toolbar">
        <div className="seg-tabs">
          {([["all", "All"], ["event", "Events & catering"], ["giftcard", "Gift cards"]] as const).map(([k, l]) => (
            <button key={k} className={tab === k ? "is-active" : ""} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
      </div>
      {list.length ? list.map((e) => (
        <div className="enq" key={e.id}>
          <div>
            <h3>{e.kind === "event" ? `🎉 ${e.eventType} · ${e.guests} guests` : `🎁 Gift card · ${rupee(e.amount ?? 0)}`} <Pill s={e.status} /></h3>
            <div className="meta">
              <span>#{e.id}</span><span>{e.name}</span>
              <a href={`mailto:${e.email}`} style={{ textDecoration: "underline" }}>{e.email}</a>
              {e.date && <span>📅 {new Date(e.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
              <span>received {agoText(e.created, now)}</span>
            </div>
          </div>
          <div className="actions">
            {e.status !== "contacted" && <button className="mini primary" onClick={() => act(e.id, "contacted")}>Mark contacted</button>}
            {e.status !== "closed" ? <button className="mini" onClick={() => act(e.id, "closed")}>Close</button> : <button className="mini" onClick={() => act(e.id, "new")}>Reopen</button>}
          </div>
          {e.message && <p className="msg">“{e.message}”</p>}
        </div>
      )) : <div className="empty">No enquiries here yet.</div>}
    </section>
  );
}

/* ------------------------------------------------------------------ menu availability */
export function MenuView({ data, run }: AdminActions) {
  const off = data.menu.filter((d) => !d.available).length;
  return (
    <section className="view">
      <p className="view-intro">Switch a dish off when the kitchen runs out. It shows as <strong>Sold out</strong> on the website straight away and can&apos;t be ordered. <strong>{off}</strong> of {data.menu.length} dishes are switched off.</p>
      {categories.map((c) => {
        const dishes = data.menu.filter((d) => d.cat === c.id);
        if (!dishes.length) return null;
        return (
          <div className="menu-cat" key={c.id}>
            <h3>{c.name}</h3>
            <div className="avail-grid">
              {dishes.map((d) => (
                <label className={`avail ${d.available ? "" : "off"}`} key={d.id}>
                  <span className="grow">{d.veg ? "🟢" : "🔺"} {d.name}<small>{rupee(d.price)} · {d.available ? "Available" : "Sold out"}</small></span>
                  <span className="toggle">
                    <input type="checkbox" checked={d.available} onChange={(e) => run("PUT", "/api/admin/availability", { id: d.id, available: e.target.checked }, `${d.name} is now ${e.target.checked ? "available" : "sold out"}`)} />
                    <span className="track" />
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ------------------------------------------------------------------ subscribers */
export function SubscribersView({ data }: AdminActions) {
  const n = data.subscribers.length;
  return (
    <section className="view">
      <div className="toolbar">
        <p className="view-intro" style={{ margin: 0 }}>{n} {n === 1 ? "person has" : "people have"} joined the Ember Letter.</p>
        <button className="btn btn-sm btn-outline-dark" onClick={() => downloadCsv("subscribers.csv", [["Email", "Birthday", "Joined"], ...data.subscribers.map((s) => [s.email, s.birthday, s.created])])}>Export CSV</button>
      </div>
      {n ? (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Email</th><th>Birthday</th><th>Joined</th></tr></thead>
            <tbody>{data.subscribers.map((s) => <tr key={s.email}><td>{s.email}</td><td>{s.birthday || "—"}</td><td>{new Date(s.created).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td></tr>)}</tbody>
          </table>
        </div>
      ) : <div className="empty">No subscribers yet.</div>}
    </section>
  );
}
