"use client";
import Image from "next/image";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client";
import { localISO } from "@/lib/hours";
import { IMG } from "@/lib/images";
import { rupee } from "@/lib/pricing";
import { CheckIcon } from "../icons";
import { useUI } from "../site/store";

const EMAIL_OK = (v: string) => /^\S+@\S+\.\S+$/.test(v.trim());

function Done({ title, children, reference }: { title: string; children: React.ReactNode; reference?: string }) {
  const { closeDialog } = useUI();
  return (
    <div className="confirm">
      <div className="confirm-icon"><CheckIcon /></div>
      <h2>{title}</h2>
      <p style={{ color: "var(--text-dark-dim)" }}>{children}</p>
      {reference && <><div className="ref">{reference}</div><br /></>}
      <button className="btn btn-dark" onClick={closeDialog}>Close</button>
    </div>
  );
}

export function EnquiryForm() {
  const { toast } = useUI();
  const [type, setType] = useState("Birthday");
  const [v, setV] = useState({ date: "", guests: "20", name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const set = (k: keyof typeof v, val: string) => { setV((s) => ({ ...s, [k]: val })); setErrors((e) => ({ ...e, [k]: false })); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const bad = { date: !v.date, guests: !(+v.guests >= 9 && +v.guests <= 500), name: v.name.trim().length < 2, email: !EMAIL_OK(v.email) };
    setErrors(bad);
    if (Object.values(bad).some(Boolean)) return;
    setBusy(true);
    try {
      await api("POST", "/api/enquiries", { kind: "event", eventType: type, date: v.date, guests: +v.guests, name: v.name, email: v.email, message: v.message });
      setSentTo(v.name.trim().split(" ")[0]);
    } catch (err) {
      setBusy(false);
      toast((err as Error).message, { error: true, duration: 6000 });
    }
  }

  if (sentTo) return <Done title="Enquiry sent">Thank you, {sentTo} — our events team will reply within one working day with menus and availability.</Done>;
  const f = (k: string) => (errors[k] ? "field has-error" : "field");
  return (
    <form className="dialog-body" onSubmit={submit} noValidate>
      <span className="eyebrow" style={{ color: "var(--ember)" }}>Private dining &amp; catering</span>
      <h2 style={{ margin: "12px 0 8px" }}>Tell us about your event</h2>
      <p style={{ color: "var(--text-dark-dim)", marginBottom: 22 }}>Our events team replies within one working day with menus and a quote.</p>
      <div className="field">
        <span className="label">Type of event</span>
        <div className="chips">
          {["Birthday", "Corporate", "Wedding / sangeet", "Outdoor catering", "Other"].map((t) => (
            <button type="button" key={t} className="chip" aria-pressed={type === t} onClick={() => setType(t)}>{t}</button>
          ))}
        </div>
      </div>
      <div className="row-2">
        <div className={f("date")}><label htmlFor="e-date">Preferred date</label><input className="input" type="date" id="e-date" min={localISO(new Date())} value={v.date} onChange={(e) => set("date", e.target.value)} /><span className="error-msg">Pick a date</span></div>
        <div className={f("guests")}><label htmlFor="e-guests">Guests</label><input className="input" type="number" id="e-guests" min={9} max={500} value={v.guests} onChange={(e) => set("guests", e.target.value)} /><span className="error-msg">From 9 to 500 guests</span></div>
      </div>
      <div className="row-2">
        <div className={f("name")}><label htmlFor="e-name">Name</label><input className="input" id="e-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} /><span className="error-msg">Please enter your name</span></div>
        <div className={f("email")}><label htmlFor="e-email">Email</label><input className="input" type="email" id="e-email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} /><span className="error-msg">Enter a valid email</span></div>
      </div>
      <div className="field"><label htmlFor="e-msg">Anything else?</label><textarea className="textarea" id="e-msg" placeholder="Budget, dietary needs, bar package…" value={v.message} onChange={(e) => set("message", e.target.value)} /></div>
      <button className="btn btn-ember btn-block" type="submit" disabled={busy}>{busy ? "Sending…" : "Send enquiry"}</button>
    </form>
  );
}

export function GiftCardForm() {
  const { toast } = useUI();
  const [amount, setAmount] = useState(2500);
  const [v, setV] = useState({ to: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  const set = (k: keyof typeof v, val: string) => { setV((s) => ({ ...s, [k]: val })); setErrors((e) => ({ ...e, [k]: false })); };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const bad = { to: v.to.trim().length < 2, email: !EMAIL_OK(v.email) };
    setErrors(bad);
    if (bad.to || bad.email) return;
    setBusy(true);
    try {
      const r = await api<{ id: string }>("POST", "/api/enquiries", { kind: "giftcard", amount, to: v.to, email: v.email, message: v.message });
      setRef(r.id);
    } catch (err) {
      setBusy(false);
      toast((err as Error).message, { error: true, duration: 6000 });
    }
  }

  if (ref) return <Done title="Gift sent!" reference={ref}>A {rupee(amount)} Ember &amp; Saffron gift card is on its way to {v.to.trim()}.</Done>;
  const f = (k: string) => (errors[k] ? "field has-error" : "field");
  return (
    <form className="dialog-body" onSubmit={submit} noValidate>
      <span className="eyebrow" style={{ color: "var(--ember)" }}>Gift cards</span>
      <h2 style={{ margin: "12px 0 8px" }}>Give a night by the fire</h2>
      <p style={{ color: "var(--text-dark-dim)", marginBottom: 22 }}>Delivered instantly by email or WhatsApp. Valid for 12 months on dining and online orders.</p>
      <div className="field">
        <span className="label">Amount</span>
        <div className="chips">
          {[1000, 2500, 5000, 10000].map((a) => <button type="button" key={a} className="chip" aria-pressed={amount === a} onClick={() => setAmount(a)}>{rupee(a)}</button>)}
        </div>
      </div>
      <div className="row-2">
        <div className={f("to")}><label htmlFor="g-to">Recipient&apos;s name</label><input className="input" id="g-to" value={v.to} onChange={(e) => set("to", e.target.value)} /><span className="error-msg">Who is it for?</span></div>
        <div className={f("email")}><label htmlFor="g-email">Recipient&apos;s email</label><input className="input" type="email" id="g-email" value={v.email} onChange={(e) => set("email", e.target.value)} /><span className="error-msg">Enter a valid email</span></div>
      </div>
      <div className="field"><label htmlFor="g-msg">Personal message</label><textarea className="textarea" id="g-msg" placeholder="Happy birthday! Dinner's on me…" value={v.message} onChange={(e) => set("message", e.target.value)} /></div>
      <button className="btn btn-ember btn-block" type="submit" disabled={busy}>{busy ? "Sending…" : `Buy gift card · ${rupee(amount)}`}</button>
      <p style={{ fontSize: 12, color: "var(--text-dark-dim)", textAlign: "center", margin: "12px 0 0" }}>Demo — no payment is taken.</p>
    </form>
  );
}

export function PrivateDining() {
  const { openDialog } = useUI();
  return (
    <section className="section" id="private" aria-labelledby="private-title" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="private reveal" suppressHydrationWarning>
          <div className="private-media">
            <Image src={IMG.terrace} alt="The lantern-lit terrace set for a private dinner" fill sizes="(max-width: 860px) 100vw, 50vw" style={{ objectFit: "cover" }} />
          </div>
          <div className="private-copy">
            <span className="eyebrow">Private dining &amp; catering</span>
            <h2 className="h-lg" id="private-title">Your celebration, <span className="italic">our fire</span></h2>
            <p>From a birthday on the terrace to a 120-guest wedding sangeet, our events team designs the menu, the bar and the room around you.</p>
            <ul className="private-list">
              <li><strong>The Terrace</strong>up to 40 guests</li>
              <li><strong>The Saffron Room</strong>12–24 guests</li>
              <li><strong>Full buyout</strong>up to 120 guests</li>
              <li><strong>Outdoor catering</strong>from 30 guests</li>
            </ul>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button className="btn btn-dark" onClick={() => openDialog({ kind: "custom", label: "Event enquiry", render: () => <EnquiryForm /> })}>Send an enquiry</button>
              <button className="btn btn-ghost" style={{ borderColor: "rgba(255,255,255,.5)" }} onClick={() => openDialog({ kind: "custom", label: "Gift cards", render: () => <GiftCardForm /> })}>Buy a gift card</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
