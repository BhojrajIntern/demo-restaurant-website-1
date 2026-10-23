"use client";
import Image from "next/image";
import { useState } from "react";
import { dishById, options, tagClass, tagLabels } from "@/lib/data";
import { IMG } from "@/lib/images";
import { rupee, unitPrice } from "@/lib/pricing";
import { VegMark } from "./dish-bits";
import { useShop, useUI } from "./store";

const HEAT = ["Not spicy", "Mild", "Medium", "Hot"];

export function DishDialog({ id }: { id: string }) {
  const dish = dishById(id);
  const { addToCart, isSoldOut } = useShop();
  const { closeDialog } = useUI();
  const [qty, setQty] = useState(1);
  const [spice, setSpice] = useState(options.spice.default);
  const [portion, setPortion] = useState(0);
  const [addons, setAddons] = useState<number[]>([]);
  if (!dish) return null;
  const soldOut = isSoldOut(dish.id);
  const opts = dish.custom ? { spice, portion, addons: [...addons].sort((a, b) => a - b) } : null;
  const total = unitPrice(dish, opts) * qty;

  return (
    <>
      {dish.img && (
        <div className="dialog-media">
          <Image src={IMG[dish.img]} alt={dish.name} sizes="(max-width: 600px) 100vw, 560px" placeholder="blur" />
        </div>
      )}
      <div className="dialog-body">
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <VegMark veg={dish.veg} />
          <small style={{ fontWeight: 800, color: "var(--text-dark-dim)" }}>{dish.veg ? "VEGETARIAN" : "NON-VEGETARIAN"}</small>
          {dish.tags.map((t) => <span key={t} className={`tag ${tagClass(t)}`}>{tagLabels[t]}</span>)}
        </div>
        <h2 id="dish-dialog-title">{dish.name}</h2>
        <p style={{ color: "var(--text-dark-dim)" }}>{dish.desc}</p>
        <p className="allergen-line">
          <strong>Allergens:</strong> {dish.allergens.length ? dish.allergens.join(", ") : "none of the 14 major allergens"} · <strong>Heat:</strong> {HEAT[dish.spice]}
        </p>
        {dish.custom && (
          <>
            <fieldset className="opt-group">
              <legend>Spice level <small>Required</small></legend>
              {options.spice.choices.map(([n], i) => (
                <label className="opt" key={n}><input type="radio" name="spice" checked={spice === i} onChange={() => setSpice(i)} /><span>{n}</span></label>
              ))}
            </fieldset>
            <fieldset className="opt-group">
              <legend>Portion <small>Required</small></legend>
              {options.portion.choices.map(([n, p], i) => (
                <label className="opt" key={n}><input type="radio" name="portion" checked={portion === i} onChange={() => setPortion(i)} /><span>{n}</span><small>{p ? "+ " + rupee(p) : ""}</small></label>
              ))}
            </fieldset>
            <fieldset className="opt-group">
              <legend>Add-ons <small>Optional · choose any</small></legend>
              {options.addons.choices.map(([n, p], i) => (
                <label className="opt" key={n}>
                  <input type="checkbox" checked={addons.includes(i)} onChange={(e) => setAddons((a) => (e.target.checked ? [...a, i] : a.filter((x) => x !== i)))} />
                  <span>{n}</span><small>+ {rupee(p)}</small>
                </label>
              ))}
            </fieldset>
          </>
        )}
      </div>
      <div className="dialog-foot">
        {soldOut ? (
          <button className="btn btn-block" disabled>Sold out today — back tomorrow</button>
        ) : (
          <>
            <div className="stepper" role="group" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
              <output>{qty}</output>
              <button onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="More">+</button>
            </div>
            <button className="btn btn-ember" onClick={() => { addToCart(dish.id, qty, opts); closeDialog(); }}>
              Add to order · {rupee(total)}
            </button>
          </>
        )}
      </div>
    </>
  );
}
