"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { categories, fees, menu, servicePincodes, tagLabels, type Dish } from "@/lib/data";
import { openStatus, orderTimes } from "@/lib/hours";
import { rupee } from "@/lib/pricing";
import { BikeIcon, SearchIcon, StoreIcon } from "../icons";
import { AddControl, DishCard, Tags, VegMark } from "../site/dish-bits";
import { useNow } from "../site/hooks";
import { useShop, useUI } from "../site/store";

type Sort = "default" | "popular" | "low" | "high";

function TextItem({ dish }: { dish: Dish }) {
  const { isSoldOut } = useShop();
  const { openDialog } = useUI();
  const soldOut = isSoldOut(dish.id);
  return (
    <div className={`text-item ${soldOut ? "is-soldout" : ""}`}>
      <div className="ti-main">
        <h3>
          <VegMark veg={dish.veg} />
          <button onClick={() => openDialog({ kind: "dish", id: dish.id })} style={{ textAlign: "left" }}>{dish.name}</button>
          {soldOut ? <span className="tag soldout">Sold out</span> : <Tags dish={dish} max={1} />}
        </h3>
        <p>{dish.desc}</p>
        <span className="price">{rupee(dish.price)}</span>
      </div>
      <AddControl dish={dish} />
    </div>
  );
}

export function OrderMenu() {
  const { cart, update, count, totals, hydrated } = useShop();
  const { openCart, cartOpen, toast } = useUI();
  const now = useNow();
  const [query, setQuery] = useState("");
  const q = useDeferredValue(query.trim().toLowerCase());
  const [vegOnly, setVegOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("default");
  const [active, setActive] = useState<string>(categories[0].id);
  const [pin, setPin] = useState("");
  const chipsRef = useRef<HTMLElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hydrated) setPin(cart.pincode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  /* ---------------- filtering & sorting */
  const groups = useMemo(() => {
    let items = menu.filter((d) => !vegOnly || d.veg);
    if (q) {
      items = items.filter((d) => {
        const hay = [d.name, d.desc, d.veg ? "veg vegetarian" : "non-veg chicken meat", ...d.tags.map((t) => tagLabels[t]), categories.find((c) => c.id === d.cat)!.name].join(" ").toLowerCase();
        return q.split(/\s+/).every((w) => hay.includes(w));
      });
    }
    if (sort === "low") items = [...items].sort((a, b) => a.price - b.price);
    if (sort === "high") items = [...items].sort((a, b) => b.price - a.price);
    if (sort === "popular") items = [...items].sort((a, b) => Number(b.tags.includes("bestseller")) - Number(a.tags.includes("bestseller")));
    return categories.map((c) => ({ ...c, items: items.filter((d) => d.cat === c.id) })).filter((c) => c.items.length);
  }, [q, vegOnly, sort]);

  /* ---------------- scroll-spy: highlight the category on screen */
  useEffect(() => {
    const root = sectionsRef.current;
    if (!root) return;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id.replace("cat-", ""));
    }, { rootMargin: "-30% 0px -60% 0px" });
    root.querySelectorAll(".menu-section").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [groups]);
  useEffect(() => {
    const chip = chipsRef.current?.querySelector<HTMLElement>(`[data-cat="${active}"]`);
    if (chip && chipsRef.current) chipsRef.current.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  /* ---------------- delivery area */
  const pinStatus = (() => {
    if (!pin) return null;
    if (!/^\d{6}$/.test(pin)) return pin.length === 6 ? { ok: false, text: "Enter a 6-digit pincode" } : null;
    return servicePincodes.includes(pin) ? { ok: true, text: "✓ We deliver here · 35–45 min" } : { ok: false, text: "Outside our delivery area — try pickup" };
  })();
  const checkPin = (value: string, announce: boolean) => {
    if (!/^\d{6}$/.test(value)) return;
    update({ pincode: value });
    if (announce && !servicePincodes.includes(value)) {
      toast(`We don't deliver to ${value} yet. Pickup is available!`, { error: true, action: "Switch to pickup", onAction: () => update({ mode: "pickup" }) });
    }
  };
  const onPinSubmit = (e: FormEvent) => { e.preventDefault(); checkPin(pin, true); };

  /* ---------------- order time */
  const open = now ? openStatus(now).open : true;
  const times = useMemo(() => (now ? orderTimes(now) : []), [now]);
  // Kitchen closed: pre-select the next available time instead of "ASAP".
  useEffect(() => {
    if (hydrated && now && !open && cart.when === "asap" && times.length) update({ when: times[0].value });
  }, [hydrated, now, open, cart.when, times, update]);

  const counts = Object.fromEntries(groups.map((g) => [g.id, g.items.length]));
  const visibleCats = categories.filter((c) => counts[c.id]);
  const showMini = hydrated && count > 0 && !cartOpen;

  return (
    <>
      <div className="container order-bar">
        <div className="order-bar-inner">
          <div className="seg" role="group" aria-label="Order type">
            <button aria-pressed={cart.mode === "delivery"} onClick={() => update({ mode: "delivery" })}><BikeIcon size={17} />Delivery</button>
            <button aria-pressed={cart.mode === "pickup"} onClick={() => update({ mode: "pickup" })}><StoreIcon size={17} />Pickup</button>
          </div>
          {cart.mode === "delivery" ? (
            <form className="addr" onSubmit={onPinSubmit} noValidate>
              <label className="sr-only" htmlFor="pincode">Delivery pincode</label>
              <input className="input" id="pincode" inputMode="numeric" maxLength={6} placeholder="Enter delivery pincode (try 560038)" autoComplete="postal-code" value={pin}
                onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setPin(v); if (v.length === 6) checkPin(v, true); }} />
              <button className="btn btn-dark btn-sm" type="submit">Check</button>
              <span className={`addr-status ${pinStatus ? (pinStatus.ok ? "ok" : "err") : ""}`} role="status">{pinStatus?.text}</span>
            </form>
          ) : (
            <div className="addr" style={{ fontWeight: 700, fontSize: 14, color: "var(--text-dark-dim)" }}><StoreIcon size={18} /> Pickup from 12th Main, Indiranagar · ready in ~25 min</div>
          )}
          <div className="order-when">
            <label className="sr-only" htmlFor="when">When</label>
            <select className="select" id="when" value={open || cart.when !== "asap" ? cart.when : ""} onChange={(e) => update({ when: e.target.value })}>
              {open ? <option value="asap">{cart.mode === "delivery" ? "ASAP · 35–45 min" : "ASAP · ready in ~25 min"}</option> : <option value="" disabled>Kitchen closed — schedule for later</option>}
              {times.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="container menu-layout">
        <aside className="cat-nav" aria-label="Menu categories">
          <h2>Menu</h2>
          <ul>
            {visibleCats.map((c) => (
              <li key={c.id}><a href={`#cat-${c.id}`} className={active === c.id ? "is-active" : ""}>{c.name}<span>{counts[c.id]}</span></a></li>
            ))}
          </ul>
          <div className="help"><strong>Allergies?</strong>Tap any dish for its allergens, or call <a href="tel:+919876543210" style={{ textDecoration: "underline" }}>+91 98765 43210</a> before ordering.</div>
        </aside>

        <div>
          <nav className="cat-chips" ref={chipsRef} aria-label="Menu categories">
            {visibleCats.map((c) => <a key={c.id} href={`#cat-${c.id}`} data-cat={c.id} className={active === c.id ? "is-active" : ""}>{c.name}</a>)}
          </nav>
          <div className="menu-tools">
            <div className="search">
              <SearchIcon size={18} />
              <label className="sr-only" htmlFor="menu-search">Search the menu</label>
              <input className="input" id="menu-search" type="search" placeholder="Search biryani, paneer, gluten-free…" autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="tools-right">
              <label className="toggle"><input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /><span className="track" />Veg only</label>
              <label className="sr-only" htmlFor="sort">Sort dishes</label>
              <select className="select" id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                <option value="default">Recommended</option>
                <option value="popular">Bestsellers first</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </div>
          </div>
          <div className="legend" aria-label="Legend">
            <span><span className="veg-mark" />Vegetarian</span>
            <span><span className="veg-mark nonveg" />Non-vegetarian</span>
            <span>🌶 Spice level</span>
            <span>Prices in ₹ · 5% GST added at checkout</span>
          </div>

          <div ref={sectionsRef} aria-live="polite">
            {groups.map((c) => {
              const withImg = c.items.filter((d) => d.img);
              const noImg = c.items.filter((d) => !d.img);
              return (
                <section className="menu-section" id={`cat-${c.id}`} key={c.id} aria-labelledby={`h-${c.id}`}>
                  <div className="menu-section-head"><h2 id={`h-${c.id}`}>{c.name}</h2><p>{c.blurb}</p></div>
                  {withImg.length > 0 && <div className="dish-grid">{withImg.map((d) => <DishCard key={d.id} dish={d} details />)}</div>}
                  {noImg.length > 0 && <div className="text-items">{noImg.map((d) => <TextItem key={d.id} dish={d} />)}</div>}
                </section>
              );
            })}
          </div>
          {groups.length === 0 && (
            <div className="no-results is-visible">
              <h3>No dishes match “{query || "veg only"}”</h3>
              <p>Try “chicken”, “biryani” or “vegan” — or clear your filters.</p>
              <button className="btn btn-dark" onClick={() => { setQuery(""); setVegOnly(false); setSort("default"); }}>Clear search &amp; filters</button>
            </div>
          )}
        </div>
      </div>

      <button className={`mini-cart ${showMini ? "is-visible" : ""}`} onClick={openCart} aria-label="View your order" aria-hidden={!showMini} tabIndex={showMini ? 0 : -1}>
        <span>
          <strong>{count} item{count === 1 ? "" : "s"}</strong>
          <small>{cart.mode === "delivery" ? (totals.after < fees.freeDeliveryAbove ? `${rupee(fees.freeDeliveryAbove - totals.after)} away from free delivery` : "Free delivery unlocked") : "Pickup · Indiranagar"}</small>
        </span>
        <span className="btn btn-sm" style={{ pointerEvents: "none" }}>View order · {rupee(totals.total)}</span>
      </button>
    </>
  );
}
