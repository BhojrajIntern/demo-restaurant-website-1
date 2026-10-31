"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { brand, MAX_ONLINE_PARTY, seatingOptions } from "@/lib/data";
import { api, RequestError } from "@/lib/client";
import { addDays, fmtTime, pad, restaurantNow, slotsFor } from "@/lib/hours";
import { CalendarIcon, CheckIcon, ClockIcon, PinIcon, UsersIcon } from "../icons";
import { useNow } from "../site/hooks";
import { useUI } from "../site/store";
import { RESERVE_DATE_EVENT } from "./Events";
import { EnquiryForm } from "./PrivateDining";

const PHONE_OK = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10));
const EMAIL_OK = (v: string) => !v.trim() || /^\S+@\S+\.\S+$/.test(v.trim());

type Booked = { ref: string; name: string; date: string; time: string; party: number; seat: string; occasion: string; email: boolean };

function downloadIcs(b: Booked) {
  const start = new Date(`${b.date}T${b.time}:00`);
  const end = new Date(start.getTime() + 2 * 3600_000);
  const fmt = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ember & Saffron//Demo//EN", "BEGIN:VEVENT",
    `UID:${b.ref}@emberandsaffron.demo`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:Dinner at Ember & Saffron (${b.party} guests)`, `LOCATION:${brand.address.replace(/,/g, "\\,")}`,
    `DESCRIPTION:Booking ref ${b.ref}`, "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "ember-and-saffron-booking.ics";
  a.click();
}

function BookingConfirmed({ b }: { b: Booked }) {
  const dateLabel = new Date(`${b.date}T${b.time}:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  return (
    <div className="confirm">
      <div className="confirm-icon"><CheckIcon /></div>
      <h2>You&apos;re booked, {b.name.split(" ")[0]}!</h2>
      <p style={{ color: "var(--text-dark-dim)", margin: 0 }}>We&apos;ve sent the details by SMS{b.email ? " and email" : ""}.</p>
      <div className="ref">{b.ref}</div>
      <div className="confirm-details">
        <div><span>Date</span><strong>{dateLabel}</strong></div>
        <div><span>Time</span><strong>{fmtTime(b.time)}</strong></div>
        <div><span>Guests</span><strong>{b.party}</strong></div>
        <div><span>Seating</span><strong>{b.seat}</strong></div>
        {b.occasion && <div><span>Occasion</span><strong>{b.occasion} 🎉</strong></div>}
      </div>
      <div className="confirm-actions">
        <button className="btn btn-dark" onClick={() => downloadIcs(b)}><CalendarIcon size={18} /> Add to calendar</button>
        <a className="btn btn-outline-dark" href="/menu">Pre-order dishes</a>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-dark-dim)", margin: "18px 0 0" }}>Your booking is now on the restaurant&apos;s reservation list.</p>
    </div>
  );
}

export function Reservation() {
  const now = useNow();
  const { openDialog, toast } = useUI();
  const [date, setDate] = useState("");
  const [party, setParty] = useState(2);
  const [seat, setSeat] = useState<string>(seatingOptions[0]);
  const [slot, setSlot] = useState<string | null>(null);
  const [full, setFull] = useState<{ date: string; list: string[] }>({ date: "", list: [] });
  const [v, setV] = useState({ name: "", phone: "", email: "", occasion: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const slotsRef = useRef<HTMLDivElement>(null);
  // dates and times in restaurant time (India), whatever the visitor's timezone
  const rnow = now ? restaurantNow(now) : null;
  const today = rnow?.iso ?? "";

  // default to today once the time is known (after the page loads)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (today && !date) setDate(today);
  }, [today, date]);

  // dates chosen from the "What's on" cards
  useEffect(() => {
    const on = (e: Event) => { setDate((e as CustomEvent<string>).detail); setSlot(null); };
    window.addEventListener(RESERVE_DATE_EVENT, on);
    return () => window.removeEventListener(RESERVE_DATE_EVENT, on);
  }, []);

  const loadFull = useCallback((d: string) => {
    api<{ full: string[] }>("GET", `/api/reservations/slots?date=${d}`).then((r) => setFull({ date: d, list: r.full })).catch(() => {});
  }, []);
  useEffect(() => { if (date) loadFull(date); }, [date, loadFull]);

  const set = (k: keyof typeof v, val: string) => { setV((s) => ({ ...s, [k]: val })); setErrors((e) => ({ ...e, [k]: false })); };

  // available slots: past times today and full slots are disabled
  const nowMins = rnow?.mins ?? 0;
  const groups = date
    ? slotsFor(date).map((g) => ({
        ...g,
        list: g.list
          .filter((t) => date !== today || Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) >= nowMins + 30)
          .map((t) => ({ t, full: (full.date === date && full.list.includes(t)) || (seat === "Bar counter" && party > 4) })),
      })).filter((g) => g.list.length)
    : [];
  const anyFree = groups.some((g) => g.list.some((s) => !s.full));
  const tooMany = party > MAX_ONLINE_PARTY;
  const step2 = !!slot;
  const step3 = step2 && v.name.trim().length > 1 && PHONE_OK(v.phone);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const bad = { date: !date, slot: !slot, name: v.name.trim().length < 2, phone: !PHONE_OK(v.phone), email: !EMAIL_OK(v.email) };
    setErrors(bad);
    if (bad.slot && !bad.name && !bad.phone) slotsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (Object.values(bad).some(Boolean) || tooMany) return;
    setBusy(true);
    try {
      const r = await api<{ id: string }>("POST", "/api/reservations", { date, time: slot, party, seating: seat, ...v });
      const booked: Booked = { ref: r.id, name: v.name.trim(), date, time: slot!, party, seat, occasion: v.occasion, email: !!v.email.trim() };
      openDialog({ kind: "custom", label: "Booking confirmed", render: () => <BookingConfirmed b={booked} /> });
      setV({ name: "", phone: "", email: "", occasion: "", notes: "" });
      setSlot(null);
      setParty(2);
      loadFull(date);
    } catch (err) {
      toast((err as Error).message, { error: true, duration: 6000 });
      if (err instanceof RequestError && err.field === "time") { setSlot(null); loadFull(date); }
    } finally {
      setBusy(false);
    }
  }

  const f = (k: string) => (errors[k] ? "field has-error" : "field");
  return (
    <section className="section section-light" id="reserve" aria-labelledby="reserve-title">
      <div className="container reserve-grid">
        <div className="reserve-info reveal" suppressHydrationWarning>
          <span className="eyebrow">Reservations</span>
          <h2 className="h-lg" id="reserve-title">Save your <span className="italic">seat by the fire</span></h2>
          <p className="lead">Instant confirmation for up to {MAX_ONLINE_PARTY} guests. Larger groups and the Saffron Room are handled by our events team.</p>
          <ul>
            <li><ClockIcon /><span><strong>Tables are held for 15 minutes</strong>Running late? Call us and we&apos;ll do our best.</span></li>
            <li><UsersIcon /><span><strong>Groups of 9 or more</strong>We&apos;ll set up a feasting menu — <button type="button" style={{ textDecoration: "underline" }} onClick={() => openDialog({ kind: "custom", label: "Event enquiry", render: () => <EnquiryForm /> })}>enquire here</button>.</span></li>
            <li><PinIcon /><span><strong>Walk-ins welcome</strong>The bar and terrace keep a few tables for the night.</span></li>
          </ul>
        </div>
        <div className="form-card reveal reveal-d1" suppressHydrationWarning>
          <form onSubmit={submit} noValidate>
            <div className="form-steps" aria-hidden="true"><span className="is-done" /><span className={step2 ? "is-done" : ""} /><span className={step3 ? "is-done" : ""} /></div>
            <div className="row-2">
              <div className={f("date")}>
                <label htmlFor="r-date">Date</label>
                <input className="input" type="date" id="r-date" min={today || undefined} max={today ? addDays(today, 60) : undefined} value={date} onChange={(e) => { setDate(e.target.value); setSlot(null); }} />
                <span className="error-msg">Please pick a date</span>
              </div>
              <div className="field">
                <span className="label" id="party-label">Guests</span>
                <div className="party" role="group" aria-labelledby="party-label">
                  <button type="button" onClick={() => { setParty((p) => Math.max(1, p - 1)); setSlot(null); }} aria-label="Fewer guests">−</button>
                  <output aria-live="polite">{party} guest{party > 1 ? "s" : ""}</output>
                  <button type="button" onClick={() => { setParty((p) => Math.min(20, p + 1)); setSlot(null); }} aria-label="More guests">+</button>
                </div>
              </div>
            </div>
            {tooMany && (
              <div className="notice">
                <UsersIcon size={20} style={{ flexShrink: 0 }} />
                <span>For {party} guests we set up a feasting menu. <button type="button" style={{ textDecoration: "underline", fontWeight: 800 }} onClick={() => openDialog({ kind: "custom", label: "Event enquiry", render: () => <EnquiryForm /> })}>Send a group enquiry</button> or call {brand.phone}.</span>
              </div>
            )}
            <div className="field">
              <span className="label">Seating preference</span>
              <div className="chips">
                {seatingOptions.map((s) => <button type="button" key={s} className="chip" aria-pressed={seat === s} onClick={() => { setSeat(s); setSlot(null); }}>{s}</button>)}
              </div>
            </div>
            <div className={f("slot")} ref={slotsRef}>
              <span className="label">Time</span>
              {date && !anyFree ? (
                <div className="slots-empty">😔 No tables left for {party}{seat === "Bar counter" ? " at the bar" : ""} on this date. Try another day or seating — or <a href={`https://wa.me/${brand.whatsappNumber}`} style={{ textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">join the waitlist on WhatsApp</a>.</div>
              ) : (
                groups.map((g) => (
                  <div className="slot-group" key={g.name}>
                    <span className="label">{g.name}</span>
                    <div className="chips">
                      {g.list.map(({ t, full: isFull }) => (
                        <button type="button" key={t} className="chip" aria-pressed={slot === t} disabled={isFull} aria-label={isFull ? `${fmtTime(t)}, fully booked` : undefined}
                          onClick={() => { setSlot(t); setErrors((e) => ({ ...e, slot: false })); }}>
                          {fmtTime(t)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
              <span className="error-msg">Please choose a time</span>
            </div>
            <div className="row-2">
              <div className={f("name")}><label htmlFor="r-name">Name</label><input className="input" id="r-name" autoComplete="name" value={v.name} onChange={(e) => set("name", e.target.value)} /><span className="error-msg">Please enter your name</span></div>
              <div className={f("phone")}><label htmlFor="r-phone">Mobile</label><input className="input" id="r-phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" value={v.phone} onChange={(e) => set("phone", e.target.value)} /><span className="error-msg">Enter a valid 10-digit mobile number</span></div>
            </div>
            <div className="row-2">
              <div className={f("email")}><label htmlFor="r-email">Email <span className="hint">(for confirmation)</span></label><input className="input" id="r-email" type="email" autoComplete="email" value={v.email} onChange={(e) => set("email", e.target.value)} /><span className="error-msg">That email doesn&apos;t look right</span></div>
              <div className="field">
                <label htmlFor="r-occasion">Occasion</label>
                <select className="select" id="r-occasion" value={v.occasion} onChange={(e) => set("occasion", e.target.value)}>
                  <option value="">None</option>
                  {["Birthday", "Anniversary", "Date night", "Business meal", "Family celebration"].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="field"><label htmlFor="r-notes">Special requests &amp; allergies</label><textarea className="textarea" id="r-notes" placeholder="High chair, wheelchair access, nut allergy…" value={v.notes} onChange={(e) => set("notes", e.target.value)} /></div>
            <div className="form-foot">
              <small>No booking fee. Free cancellation up to 2 hours before.</small>
              <button className="btn btn-ember" type="submit" disabled={busy || tooMany}>{busy ? "Checking the table…" : "Confirm reservation"}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
