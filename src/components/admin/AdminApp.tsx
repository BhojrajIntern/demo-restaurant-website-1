"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { api, RequestError } from "@/lib/client";
import type { AdminData } from "@/lib/types";
import { LogoMark } from "../icons";
import { chime } from "./util";
import { DashboardView, EnquiriesView, MenuView, OrdersView, ReservationsView, SubscribersView } from "./views";
import { OrderDrawer } from "./OrderDrawer";

const POLL_MS = 5000;
type View = "dashboard" | "orders" | "reservations" | "enquiries" | "menu" | "subscribers";
const TITLES: Record<View, string> = { dashboard: "Dashboard", orders: "Orders", reservations: "Reservations", enquiries: "Enquiries", menu: "Menu availability", subscribers: "Newsletter subscribers" };
const NAV: [View, string, string][] = [["dashboard", "◧", "Dashboard"], ["orders", "🧾", "Orders"], ["reservations", "📅", "Reservations"], ["enquiries", "✉", "Enquiries"], ["menu", "🍛", "Menu availability"], ["subscribers", "★", "Subscribers"]];

type Toast = { id: number; msg: string; error?: boolean };

export type AdminActions = {
  data: AdminData;
  now: number;
  fresh: Set<string>;
  run: (method: string, url: string, body: unknown, success: string) => Promise<boolean>;
  openOrder: (id: string) => void;
  go: (v: View, resDate?: string) => void;
  resDate: string;
  setResDate: (d: string) => void;
};

/* ------------------------------------------------------------------ login */
function Login({ onDone, locked }: { onDone: () => void; locked: boolean }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("POST", "/api/admin/login", { password: pw });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="login">
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="login-brand"><LogoMark className="logo-mark" /><span>Ember <em>&amp;</em> Saffron</span></div>
        <h1>Manager login</h1>
        <p>Orders, reservations and enquiries from the website arrive here live.</p>
        {locked && (
          <div className="notice" role="alert" style={{ marginBottom: 16 }}>
            <span>The dashboard is locked until the site owner sets a strong <code>ADMIN_PASSWORD</code> (10+ characters) on the server. See DEPLOY.md.</span>
          </div>
        )}
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input className="input" type={show ? "text" : "password"} id="pw" autoComplete="current-password" autoCapitalize="off" autoCorrect="off" spellCheck={false} autoFocus
            value={pw} onChange={(e) => setPw(e.target.value)} onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))} />
          <label className="checkbox" style={{ marginTop: 4 }}><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show password</label>
          {caps && <span className="hint" style={{ color: "#b23a2a", fontWeight: 700 }}>⚠ Caps Lock is on</span>}
        </div>
        <p className="login-error" role="alert">{error}</p>
        <button className="btn btn-ember btn-block" type="submit" disabled={busy}>{busy ? "Checking…" : "Log in"}</button>
        {process.env.NODE_ENV !== "production" && <p className="login-hint">Development password: <code>ember-admin</code></p>}
      </form>
    </section>
  );
}

/* ------------------------------------------------------------------ app */
export function AdminApp() {
  const [auth, setAuth] = useState<"checking" | "out" | "in">("checking");
  const [locked, setLocked] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [updated, setUpdated] = useState("");
  const [now, setNow] = useState(0);
  const [sound, setSound] = useState(true);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [resDate, setResDate] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [failures, setFailures] = useState(0);
  const live = failures < 2;
  // order ids from the previous poll — used only inside an effect to spot new orders
  const prevIds = useRef<Set<string> | null>(null);

  const toast = useCallback((msg: string, error?: boolean) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, msg, error }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const d = await api<AdminData>("GET", "/api/admin/data");
      setFailures(0);
      setData(d);
      setResDate((r) => r || d.today);
      setNow(Date.now());
      setUpdated(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", second: "2-digit" }));
    } catch (e) {
      if (e instanceof RequestError && e.status === 401) { setAuth("out"); return; }
      setFailures((f) => f + 1);
    }
  }, []);

  // New-order alert: compare with the previous poll (the first load never alerts).
  useEffect(() => {
    if (!data) return;
    const ids = new Set(data.orders.map((o) => o.id));
    const before = prevIds.current;
    prevIds.current = ids;
    if (!before) return;
    const incoming = data.orders.filter((o) => !before.has(o.id));
    if (!incoming.length) return;
    if (sound) chime();
    toast(`New order ${incoming.map((o) => "#" + o.id).join(", ")} · ₹${incoming[0].totals.total.toLocaleString("en-IN")}`);
    const newIds = incoming.map((o) => o.id);
     
    setFresh((f) => new Set([...f, ...newIds]));
    setTimeout(() => setFresh((f) => new Set([...f].filter((x) => !newIds.includes(x)))), 15000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  // after logging in again, don't treat existing orders as new
  useEffect(() => { if (auth !== "in") prevIds.current = null; }, [auth]);

  // check the session once
  useEffect(() => {
    api<{ loggedIn: boolean; configured: boolean }>("GET", "/api/admin/me")
      .then((r) => { setLocked(!r.configured); setAuth(r.loggedIn ? "in" : "out"); })
      .catch(() => setAuth("out"));
  }, []);
  // poll while logged in
  useEffect(() => {
    if (auth !== "in") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const t = setInterval(refresh, POLL_MS);
    return () => clearInterval(t);
  }, [auth, refresh]);
  // browser tab title shows waiting orders
  useEffect(() => {
    const n = data?.stats.newOrders ?? 0;
    document.title = (n ? `(${n}) New order${n > 1 ? "s" : ""} · ` : "") + "Manager — Ember & Saffron";
  }, [data?.stats.newOrders]);

  const run = useCallback<AdminActions["run"]>(async (method, url, body, success) => {
    try {
      await api(method, url, body);
      toast(success);
      await refresh();
      return true;
    } catch (e) {
      toast((e as Error).message, true);
      refresh();
      return false;
    }
  }, [toast, refresh]);

  const go = useCallback((v: View, d?: string) => { if (d) setResDate(d); setView(v); window.scrollTo(0, 0); }, []);
  const closeOrder = useCallback(() => setOpenId(null), []);
  const onLogin = useCallback(() => setAuth("in"), []);
  const actions = useMemo<AdminActions | null>(
    () => (data ? { data, now, fresh, run, openOrder: setOpenId, go, resDate, setResDate } : null),
    [data, now, fresh, run, go, resDate],
  );

  if (auth === "checking") return <div className="admin" />;
  if (auth === "out") return <div className="admin"><Login onDone={onLogin} locked={locked} /></div>;

  const s = data?.stats;
  const counts: Partial<Record<View, number>> = { orders: s?.newOrders, reservations: s?.bookingsToday, enquiries: s?.newEnquiries };

  return (
    <div className="admin">
      <div className="app">
        <aside className="side">
          <a className="side-brand" href="/" target="_blank" rel="noopener noreferrer" title="Open website">
            <LogoMark className="logo-mark" />
            <span>Ember <em>&amp;</em> Saffron<small>Manager</small></span>
          </a>
          <nav className="side-nav" aria-label="Sections">
            {NAV.map(([v, ico, label]) => (
              <button key={v} className={view === v ? "is-active" : ""} onClick={() => go(v)} aria-current={view === v ? "page" : undefined}>
                <span className="ico" aria-hidden="true">{ico}</span>{label}
                {!!counts[v] && <span className={`count ${v === "reservations" ? "soft" : ""}`}>{counts[v]}</span>}
              </button>
            ))}
          </nav>
          <div className="side-foot">
            <label className="sound"><input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} /> <span>🔔 Sound for new orders</span></label>
            <a href="/" target="_blank" rel="noopener noreferrer">View website ↗</a>
            <button onClick={async () => { try { await api("POST", "/api/admin/logout"); } catch { /* ignore */ } setAuth("out"); }}>Log out</button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div>
              <h1>{TITLES[view]}</h1>
              <p>{data ? new Date(data.today + "T12:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}</p>
            </div>
            <div className="topbar-right">
              <span className={`live ${live ? "" : "off"}`}><i />{live ? "Live" : "Offline — retrying"}</span>
              <span className="updated">{updated && `Updated ${updated}`}</span>
            </div>
          </header>
          {data?.showcase && (
            <div className="notice info" role="status" style={{ margin: "0 0 16px" }}>
              <span><strong>Showcase mode:</strong> this dashboard shows sample data. Orders, bookings and sign-ups from the website are not saved, and changes made here won&apos;t stick.</span>
            </div>
          )}
          {!actions ? <div className="empty">Loading…</div> : (
            <>
              {view === "dashboard" && <DashboardView {...actions} />}
              {view === "orders" && <OrdersView {...actions} />}
              {view === "reservations" && <ReservationsView {...actions} />}
              {view === "enquiries" && <EnquiriesView {...actions} />}
              {view === "menu" && <MenuView {...actions} />}
              {view === "subscribers" && <SubscribersView {...actions} />}
            </>
          )}
        </main>
      </div>

      {actions && <OrderDrawer id={openId} onClose={closeOrder} {...actions} />}

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}><span className={`t-ico ${t.error ? "err" : ""}`}>{t.error ? "!" : "✓"}</span><span>{t.msg}</span></div>
        ))}
      </div>
    </div>
  );
}
