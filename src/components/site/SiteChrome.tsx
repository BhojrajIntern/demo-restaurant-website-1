"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { brand } from "@/lib/data";
import { storage } from "@/lib/client";
import { ArrowUp, BagIcon, BikeIcon, CalendarIcon, CartIcon, CheckIcon, CloseIcon, LogoMark, MenuIcon, PhoneIcon } from "../icons";
import { usePrefersReducedMotion, useScrollLock } from "./hooks";
import { OpenStatus } from "./OpenStatus";
import { useShop, useUI } from "./store";

export const NAV: [string, string][] = [
  ["/#menu", "Menu"],
  ["/menu", "Order Online"],
  ["/#reserve", "Reserve"],
  ["/#story", "Our Story"],
  ["/#events", "What's On"],
  ["/#visit", "Visit"],
];

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Ember & Saffron home">
      <LogoMark />
      <span>
        <span className="logo-text">Ember <em>&amp;</em> Saffron</span>
        <span className="logo-sub">Modern Indian · Bengaluru</span>
      </span>
    </Link>
  );
}

/* ------------------------------------------------------------------ announcement bar (homepage) */
const MESSAGES = [
  <>🪔 Diwali Feast menu now on — 7 courses, ₹1,499 · <Link href="/#events">See dates</Link></>,
  <>15% off your first online order with code <strong>EMBER15</strong> · <Link href="/menu">Order now</Link></>,
  <>Free delivery on orders above ₹799 across Indiranagar, Domlur &amp; Koramangala</>,
];

export function Announcement() {
  const pathname = usePathname();
  const reduce = usePrefersReducedMotion();
  const [closed, setClosed] = useState(true);
  const [i, setI] = useState(0);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClosed(storage.get("es-announce-closed", false));
  }, []);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % MESSAGES.length), 4500);
    return () => clearInterval(t);
  }, [reduce]);
  if (pathname !== "/" || closed) return null;
  return (
    <div className="announce" id="announce" role="region" aria-label="Announcements">
      <div className="container">
        <div className="announce-track">
          {MESSAGES.map((m, n) => (
            <p key={n} className={`announce-msg ${n === i ? "is-active" : ""}`} aria-hidden={n !== i}>{m}</p>
          ))}
        </div>
        <button className="announce-close" aria-label="Dismiss announcements" onClick={() => { setClosed(true); storage.set("es-announce-closed", true); }}>
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ header + mobile menu */
export function Header() {
  const pathname = usePathname();
  const { count, hydrated } = useShop();
  const { openCart } = useUI();
  const [solid, setSolid] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [bump, setBump] = useState(false);
  useScrollLock(navOpen);

  useEffect(() => {
    const onScroll = () => {
      const announce = document.getElementById("announce");
      setSolid(window.scrollY > (announce?.offsetHeight ?? 0) + 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (!count) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [count]);

  // close the mobile menu when navigating or when this page is hidden
  useLayoutEffect(() => () => setNavOpen(false), [pathname]);
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [navOpen]);

  return (
    <>
      <header className={`site-header is-overlay ${solid ? "is-solid" : ""}`}>
        <div className="container header-inner">
          <Logo />
          <nav className="main-nav" aria-label="Main">
            <ul>
              {NAV.map(([href, label]) => (
                <li key={href}><Link href={href} aria-current={href === pathname ? "page" : undefined}>{label}</Link></li>
              ))}
            </ul>
          </nav>
          <div className="header-actions">
            <a className="icon-btn header-phone" href={brand.phoneHref} aria-label="Call us"><PhoneIcon size={21} /></a>
            <button className="icon-btn" onClick={openCart} aria-label={`Open your order, ${count} items`}>
              <CartIcon size={21} />
              <span className={`cart-count ${hydrated && count ? "has-items" : ""} ${bump ? "bump" : ""}`} aria-hidden="true">{count}</span>
            </button>
            <Link className="btn btn-sm header-book" href="/#reserve">Book a table</Link>
            <button className="icon-btn menu-toggle" aria-label="Open menu" aria-expanded={navOpen} aria-controls="mobile-nav" onClick={() => setNavOpen(true)}>
              <MenuIcon size={21} />
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-nav ${navOpen ? "is-open" : ""}`} id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!navOpen}>
        <div className="mobile-nav-head">
          <Logo />
          <button className="icon-btn" onClick={() => setNavOpen(false)} aria-label="Close menu"><CloseIcon size={21} /></button>
        </div>
        <ul>
          {NAV.map(([href, label], n) => (
            <li key={href}><Link href={href} onClick={() => setNavOpen(false)} tabIndex={navOpen ? 0 : -1}>{label}<span>0{n + 1}</span></Link></li>
          ))}
        </ul>
        <div className="mobile-nav-foot">
          <Link className="btn btn-block" href="/#reserve" onClick={() => setNavOpen(false)} tabIndex={navOpen ? 0 : -1}>Book a table</Link>
          <a className="btn btn-ghost btn-block" href={brand.phoneHref} tabIndex={navOpen ? 0 : -1}><PhoneIcon size={18} /> {brand.phone}</a>
          <p><OpenStatus /></p>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ small floating pieces */
function useScrolledPast(px: number) {
  const [past, setPast] = useState(false);
  useEffect(() => {
    const on = () => setPast(window.scrollY > px);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [px]);
  return past;
}

/** Call / Book / Order bar on phones (not on the order page, which has its own cart bar). */
export function ActionBar() {
  const pathname = usePathname();
  const visible = useScrolledPast(500);
  if (pathname === "/menu" || pathname?.startsWith("/admin")) return null;
  return (
    <nav className={`action-bar ${visible ? "is-visible" : ""}`} aria-label="Quick actions">
      <a className="ab-ghost" href={brand.phoneHref}><PhoneIcon size={18} /> Call</a>
      <Link className="ab-ghost" href="/#reserve"><CalendarIcon size={18} /> Book</Link>
      <Link className="ab-primary" href="/menu"><BagIcon size={18} /> Order online</Link>
    </nav>
  );
}

export function BackToTop() {
  const visible = useScrolledPast(900);
  return (
    <button className={`back-top ${visible ? "is-visible" : ""}`} aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <ArrowUp size={20} />
    </button>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useUI();
  const pathname = usePathname();
  return (
    <div className="toast-stack" aria-live="polite" style={pathname === "/menu" ? { bottom: 96 } : undefined}>
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <span className={`t-ico ${t.error ? "err" : ""}`}>{t.error ? "!" : <CheckIcon size={14} strokeWidth={3} />}</span>
          <span>{t.msg}</span>
          {t.action && <button onClick={() => { t.onAction?.(); dismissToast(t.id); }}>{t.action}</button>}
        </div>
      ))}
    </div>
  );
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (storage.get<string | null>("es-cookie", null) !== null) return;
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);
  const choose = (v: string) => { storage.set("es-cookie", v); setVisible(false); };
  return (
    <div className={`cookie ${visible ? "is-visible" : ""}`} role="region" aria-label="Cookie preferences">
      <h3>A pinch of cookies?</h3>
      <p>We use a few cookies to remember your order and improve the site. Nothing spicy — read our <Link href="/legal#cookies" style={{ textDecoration: "underline" }}>cookie policy</Link>.</p>
      <div className="row">
        <button className="btn btn-ghost btn-sm" onClick={() => choose("essential")}>Essential only</button>
        <button className="btn btn-sm" onClick={() => choose("all")}>Accept all</button>
      </div>
    </div>
  );
}

/** Lets a customer reopen live tracking for their latest order. */
export function TrackPill() {
  const { lastOrder, hydrated } = useShop();
  const { openDialog, dialog } = useUI();
  const pathname = usePathname();
  if (!hydrated || !lastOrder || lastOrder.done || dialog?.kind === "track") return null;
  return (
    <button
      className="btn btn-ember btn-sm"
      style={{ position: "fixed", left: 20, bottom: pathname === "/menu" ? 84 : 20, zIndex: 46, boxShadow: "var(--shadow)" }}
      onClick={() => openDialog({ kind: "track", id: lastOrder.id, token: lastOrder.token, mode: lastOrder.mode })}
    >
      <BikeIcon size={18} /> Track order #{lastOrder.id}
    </button>
  );
}

/** Fades sections in as they scroll into view (elements with the "reveal" class). */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => document.querySelectorAll(".reveal:not(.is-in)").forEach((e) => io.observe(e));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);
  return null;
}
