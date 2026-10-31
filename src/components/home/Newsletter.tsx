"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/client";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [bday, setBday] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    let msg = "";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) msg = "Please enter a valid email address.";
    else if (bday && !/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])$/.test(bday)) msg = "Birthday should look like 21/10.";
    else if (!consent) msg = "Please tick the box to agree to receive emails.";
    setError(msg);
    if (msg) return;
    setBusy(true);
    try {
      await api("POST", "/api/subscribe", { email, birthday: bday, consent });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section" aria-labelledby="news-title">
      <div className="container">
        <div className="newsletter reveal" suppressHydrationWarning>
          <div>
            <span className="eyebrow">The Ember Letter</span>
            <h2 className="h-lg" id="news-title" style={{ marginTop: 16 }}>First dibs on <span className="italic">feasts &amp; tables</span></h2>
            <p className="lead" style={{ marginTop: 16 }}>One email a month: new dishes, festival menus and Chef&apos;s Table seats before anyone else. Plus a treat on your birthday.</p>
          </div>
          <form className="news-form" onSubmit={submit} noValidate>
            {done ? (
              <div className="form-success is-visible" role="status">You&apos;re on the list! Check your inbox for a little welcome. 🔥</div>
            ) : (
              <>
                <div className="news-row">
                  <label className="sr-only" htmlFor="n-email">Email address</label>
                  <input className="input" id="n-email" type="email" placeholder="Your email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="btn" type="submit" disabled={busy}>{busy ? "…" : "Subscribe"}</button>
                </div>
                <div className="news-row">
                  <label className="sr-only" htmlFor="n-bday">Birthday (optional)</label>
                  <input className="input" id="n-bday" type="text" placeholder="Birthday (optional) — DD/MM" inputMode="numeric" maxLength={5} value={bday}
                    onChange={(e) => { let x = e.target.value.replace(/\D/g, "").slice(0, 4); if (x.length > 2) x = x.slice(0, 2) + "/" + x.slice(2); setBday(x); }} />
                </div>
                <label className="checkbox"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> I agree to receive emails and accept the <Link href="/legal#privacy" style={{ textDecoration: "underline" }}>privacy policy</Link>.</label>
                {error && <span className="error-msg" role="alert" style={{ display: "block" }}>{error}</span>}
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
