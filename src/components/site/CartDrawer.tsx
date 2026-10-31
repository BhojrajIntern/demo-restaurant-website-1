"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { coupons, dishById, fees } from "@/lib/data";
import { IMG } from "@/lib/images";
import { optionsLabel, rupee, unitPrice } from "@/lib/pricing";
import { BikeIcon, BowlIcon, CloseIcon, StoreIcon } from "../icons";
import { VegMark } from "./dish-bits";
import { useScrollLock } from "./hooks";
import { useShop, useUI } from "./store";

export function CartDrawer() {
  const { cartOpen, closeCart, openDialog, toast } = useUI();
  const { cart, totals, update, changeQty, hydrated } = useShop();
  const [code, setCode] = useState("");
  const closeBtn = useRef<HTMLButtonElement>(null);
  useScrollLock(cartOpen);

  useEffect(() => {
    if (!cartOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(cart.coupon ?? "");
    const prev = document.activeElement as HTMLElement | null;
    setTimeout(() => closeBtn.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); prev?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  function applyCoupon(e: FormEvent) {
    e.preventDefault();
    const v = code.trim().toUpperCase() || null;
    update({ coupon: v });
    if (v && !coupons[v]) toast(`Coupon ${v} doesn't exist.`, { error: true });
  }

  const left = fees.freeDeliveryAbove - totals.after;
  const empty = !hydrated || cart.items.length === 0;

  return (
    <>
      <div className={`scrim ${cartOpen ? "is-open" : ""}`} onClick={closeCart} />
      <aside className={`drawer ${cartOpen ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-labelledby="cart-title" aria-hidden={!cartOpen}>
        <div className="drawer-head">
          <h2 id="cart-title">Your order</h2>
          <button ref={closeBtn} className="icon-btn" onClick={closeCart} aria-label="Close order"><CloseIcon size={21} /></button>
        </div>
        <div className="drawer-body">
          {empty ? (
            <div className="cart-empty">
              <div className="bowl"><BowlIcon size={44} /></div>
              <h3>Your order is empty</h3>
              <p>Our butter chicken is getting lonely. Browse the menu and add something delicious.</p>
              <Link href="/menu" className="btn btn-dark" onClick={closeCart}>Browse the menu</Link>
            </div>
          ) : (
            <>
              <div className="seg" role="group" aria-label="Order type" style={{ width: "100%", marginBottom: 14 }}>
                <button style={{ flex: 1, justifyContent: "center" }} aria-pressed={cart.mode === "delivery"} onClick={() => update({ mode: "delivery" })}><BikeIcon size={17} /> Delivery</button>
                <button style={{ flex: 1, justifyContent: "center" }} aria-pressed={cart.mode === "pickup"} onClick={() => update({ mode: "pickup" })}><StoreIcon size={17} /> Pickup</button>
              </div>
              <div className="free-progress">
                {cart.mode === "pickup" ? "Pickup from Demo Nagar · ready in about 25 minutes" : left > 0
                  ? <>Add <strong>{rupee(left)}</strong> more for <strong>free delivery</strong></>
                  : <>🎉 You&apos;ve unlocked <strong>free delivery</strong></>}
                {cart.mode === "delivery" && <div className="bar"><i style={{ width: `${Math.min(100, (totals.after / fees.freeDeliveryAbove) * 100)}%` }} /></div>}
              </div>
              {cart.items.map((i) => {
                const d = dishById(i.id);
                if (!d) return null;
                return (
                  <div className="cart-item" key={i.key}>
                    {d.img ? <Image className="cart-thumb" src={IMG[d.img]} alt="" sizes="64px" /> : <div className="cart-thumb">{d.name.charAt(0)}</div>}
                    <div>
                      <h4><VegMark veg={d.veg} />{d.name}</h4>
                      {i.opts && <div className="opts">{optionsLabel(i.opts)}</div>}
                      <div className="stepper" role="group" aria-label={`${d.name} quantity`}>
                        <button onClick={() => changeQty(i.key, -1)} aria-label="Remove one">−</button>
                        <output>{i.qty}</output>
                        <button onClick={() => changeQty(i.key, 1)} aria-label="Add one">+</button>
                      </div>
                    </div>
                    <div>
                      <div className="line-price">{rupee(unitPrice(d, i.opts) * i.qty)}</div>
                      <button className="remove-btn" onClick={() => changeQty(i.key, -i.qty)}>Remove</button>
                    </div>
                  </div>
                );
              })}
              <label className="sr-only" htmlFor="cart-note">Note for the kitchen</label>
              <textarea id="cart-note" className="textarea cart-note" placeholder="Note for the kitchen (allergies, less spicy, no onion…)" value={cart.note} maxLength={500} onChange={(e) => update({ note: e.target.value })} />
              <form className="coupon-form" onSubmit={applyCoupon} noValidate>
                <label className="sr-only" htmlFor="coupon-input">Coupon code</label>
                <input id="coupon-input" className="input" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" />
                <button className="btn btn-outline-dark btn-sm" type="submit">{cart.coupon && !totals.couponError ? "Change" : "Apply"}</button>
              </form>
              <div className={`coupon-msg ${totals.couponError ? "err" : cart.coupon ? "ok" : ""}`} aria-live="polite">
                {totals.couponError ?? (cart.coupon ? `✓ ${cart.coupon} applied — ${coupons[cart.coupon].label}` : "Try EMBER15 or FEAST100")}
              </div>
              <div className="totals" style={{ margin: "14px 0 4px" }}>
                <div><span>Subtotal</span><span>{rupee(totals.subtotal)}</span></div>
                {totals.discount > 0 && <div className="discount"><span>Discount ({cart.coupon})</span><span>−{rupee(totals.discount)}</span></div>}
                {cart.mode === "delivery" && <div><span>Delivery</span><span>{totals.delivery ? rupee(totals.delivery) : "Free"}</span></div>}
                <div><span>Packaging</span><span>{rupee(totals.packaging)}</span></div>
                <div><span>GST (5%)</span><span>{rupee(totals.gst)}</span></div>
                <div className="grand"><span>Total</span><span>{rupee(totals.total)}</span></div>
              </div>
            </>
          )}
        </div>
        {!empty && (
          <div className="drawer-foot">
            <button className="btn btn-ember btn-block" disabled={totals.subtotal < fees.minOrder} onClick={() => openDialog({ kind: "checkout" })}>
              Checkout · {rupee(totals.total)}
            </button>
            {totals.subtotal < fees.minOrder && <p className="coupon-msg err" style={{ margin: "8px 0 0", textAlign: "center" }}>Minimum order is {rupee(fees.minOrder)}</p>}
          </div>
        )}
      </aside>
    </>
  );
}
