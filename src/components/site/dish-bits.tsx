"use client";
import Image from "next/image";
import { tagClass, tagLabels, type Dish } from "@/lib/data";
import { IMG } from "@/lib/images";
import { rupee } from "@/lib/pricing";
import { useShop, useUI } from "./store";

export function VegMark({ veg }: { veg: boolean }) {
  return <span className={`veg-mark ${veg ? "" : "nonveg"}`} role="img" aria-label={veg ? "Vegetarian" : "Non-vegetarian"} title={veg ? "Vegetarian" : "Non-vegetarian"} />;
}

export function Spice({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="spice" role="img" aria-label={`Spice level ${level} of 3`}>
      {[1, 2, 3].map((i) => (
        <i key={i} className={i <= level ? "on" : ""}>🌶</i>
      ))}
    </span>
  );
}

export function Tags({ dish, max = 9, soldOut }: { dish: Dish; max?: number; soldOut?: boolean }) {
  return (
    <>
      {soldOut && <span className="tag soldout">Sold out today</span>}
      {dish.tags.slice(0, max).map((t) => (
        <span key={t} className={`tag ${tagClass(t)}`}>{tagLabels[t]}</span>
      ))}
    </>
  );
}

/** "Add +" button, quantity stepper, or "Sold out" — depending on the dish and the cart. */
export function AddControl({ dish }: { dish: Dish }) {
  const { isSoldOut, qtyOf, changeQtyById, hydrated } = useShop();
  const { openDialog } = useUI();
  if (isSoldOut(dish.id)) return <button className="add-btn" disabled>Sold out</button>;
  const q = hydrated ? qtyOf(dish.id) : 0;
  if (dish.custom) {
    return (
      <div>
        <button className="add-btn" onClick={() => openDialog({ kind: "dish", id: dish.id })} aria-label={`Add ${dish.name}, customisable`}>
          {q ? "Add more" : "Add +"}
        </button>
        <div className="custom-note">{q ? `${q} in order` : "Customisable"}</div>
      </div>
    );
  }
  if (q > 0) {
    return (
      <div className="stepper" role="group" aria-label={`${dish.name} quantity`}>
        <button onClick={() => changeQtyById(dish.id, -1)} aria-label="Remove one">−</button>
        <output aria-live="polite">{q}</output>
        <button onClick={() => changeQtyById(dish.id, 1)} aria-label="Add one">+</button>
      </div>
    );
  }
  return <button className="add-btn" onClick={() => changeQtyById(dish.id, 1)} aria-label={`Add ${dish.name}`}>Add +</button>;
}

/** Photo card used in the signature carousel and on the order page. */
export function DishCard({ dish, details = false, sizes = "(max-width: 860px) 128px, 300px" }: { dish: Dish; details?: boolean; sizes?: string }) {
  const { isSoldOut } = useShop();
  const { openDialog } = useUI();
  const soldOut = isSoldOut(dish.id);
  return (
    <article className={`dish-card ${soldOut ? "is-soldout" : ""}`}>
      <button className="dish-media" onClick={() => openDialog({ kind: "dish", id: dish.id })} aria-label={`View ${dish.name} details`}>
        {dish.img && <Image src={IMG[dish.img]} alt={dish.name} sizes={sizes} placeholder="blur" />}
        <span className="tags"><Tags dish={dish} max={2} soldOut={soldOut} /></span>
      </button>
      <div className="dish-body">
        <div className="dish-title"><VegMark veg={dish.veg} /><h3>{dish.name}</h3></div>
        <p className="dish-desc">{dish.desc}</p>
        {details && (
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Spice level={dish.spice} />
            <button className="btn-info" onClick={() => openDialog({ kind: "dish", id: dish.id })}>Details &amp; allergens</button>
          </div>
        )}
        <div className="dish-foot">
          <span className="price">{rupee(dish.price)}</span>
          <AddControl dish={dish} />
        </div>
      </div>
    </article>
  );
}
