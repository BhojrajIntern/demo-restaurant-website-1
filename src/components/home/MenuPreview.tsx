"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { categories, menu, type CategoryId, type Dish } from "@/lib/data";
import { IMG } from "@/lib/images";
import { rupee } from "@/lib/pricing";
import { Spice, Tags, VegMark } from "../site/dish-bits";
import { useShop } from "../site/store";

const PREVIEW = categories.filter((c) => c.id !== "breads-rice");

export function MenuPreview() {
  const [cat, setCat] = useState<CategoryId>(PREVIEW[0].id);
  const [vegOnly, setVegOnly] = useState(false);
  const [hovered, setHovered] = useState<Dish | null>(null);
  const { isSoldOut } = useShop();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const items = menu.filter((d) => d.cat === cat && (!vegOnly || d.veg));
  const catName = categories.find((c) => c.id === cat)!.name;
  const featured = hovered && hovered.cat === cat && hovered.img ? hovered : items.find((d) => d.img);

  const onKey = (e: KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + PREVIEW.length) % PREVIEW.length;
    setCat(PREVIEW[n].id);
    tabs.current[n]?.focus();
  };

  return (
    <section className="section" id="menu" aria-labelledby="menu-title">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">The menu</span><h2 className="h-lg" id="menu-title">Built for <span className="italic">sharing</span></h2></div>
          <p className="lead">Order a few plates for the table, something from the tandoor, a curry and bread. Not sure? Ask for the Royal Thali.</p>
        </div>
        <div className="menu-preview-grid">
          <div>
            <div className="tabs" role="tablist" aria-label="Menu categories">
              {PREVIEW.map((c, i) => (
                <button
                  key={c.id}
                  ref={(el) => { tabs.current[i] = el; }}
                  className="tab" role="tab" id={`tab-${c.id}`} aria-selected={cat === c.id} aria-controls="menu-list" tabIndex={cat === c.id ? 0 : -1}
                  onClick={() => setCat(c.id)} onKeyDown={(e) => onKey(e, i)}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", margin: "-14px 0 10px" }}>
              <label className="toggle"><input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} /><span className="track" />Vegetarian only</label>
            </div>
            <div className="menu-list" id="menu-list" role="tabpanel" aria-labelledby={`tab-${cat}`} aria-live="polite">
              {items.length ? items.map((d) => {
                const soldOut = isSoldOut(d.id);
                return (
                  <div key={d.id} className={`menu-row ${soldOut ? "is-soldout" : ""}`} onMouseEnter={() => setHovered(d)}>
                    <div className="menu-row-top"><VegMark veg={d.veg} /><h4>{d.name}</h4><span className="dots" /><span className="row-price">{rupee(d.price)}</span></div>
                    <p>{d.desc}</p>
                    <div className="row-tags"><Tags dish={d} soldOut={soldOut} /><Spice level={d.spice} /></div>
                  </div>
                );
              }) : <p className="muted" style={{ gridColumn: "1/-1", padding: "30px 0" }}>No vegetarian dishes in this section — try another tab.</p>}
            </div>
            <div className="menu-actions">
              <Link className="btn" href="/menu">Full menu &amp; order online</Link>
              <Link className="link-arrow" href="/legal#allergens">Allergen guide</Link>
              <span className="muted" style={{ fontSize: 13 }}>Prices in ₹, exclusive of 5% GST.</span>
            </div>
          </div>
          {featured?.img && (
            <figure className="menu-feature">
              <Image key={featured.id} src={IMG[featured.img]} alt={featured.name} sizes="380px" placeholder="blur" />
              <figcaption><small>{catName}</small><span>{featured.name}</span></figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
