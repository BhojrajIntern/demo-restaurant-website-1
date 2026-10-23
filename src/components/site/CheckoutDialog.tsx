"use client";
import { useRef, useState, type FormEvent } from "react";
import { brand, servicePincodes } from "@/lib/data";
import { api, RequestError } from "@/lib/client";
import { rupee } from "@/lib/pricing";
import { StoreIcon } from "../icons";
import { useShop, useUI } from "./store";

type Field = "name" | "phone" | "address" | "pincode";
const PHONE_OK = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10));

export function CheckoutDialog() {
  const { cart, totals, count, update, clearCart, setLastOrder } = useShop();
  const { openDialog, toast } = useUI();
  const deliv = cart.mode === "delivery";
  const [values, setValues] = useState({ name: "", phone: "", address: "", pincode: cart.pincode });
  const [label, setLabel] = useState("Home");
  // No online payment yet: customers pay when they receive the order.
  const payOptions = deliv ? ["Cash on delivery", "UPI on delivery", "Card on delivery"] : ["Pay at counter"];
  const [payment, setPayment] = useState(payOptions[0]);
  const [whatsapp, setWhatsapp] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);
  const pincodeRef = useRef<HTMLInputElement>(null);
  const focusField = (k: Field) => ({ name: nameRef, phone: phoneRef, address: addressRef, pincode: pincodeRef })[k].current?.focus();

  const set = (k: Field, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: false }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    const checks: [Field, boolean][] = [
      ["name", values.name.trim().length > 1],
      ["phone", PHONE_OK(values.phone)],
      ...(deliv ? ([["address", values.address.trim().length > 8], ["pincode", servicePincodes.includes(values.pincode.trim())]] as [Field, boolean][]) : []),
    ];
    const bad = checks.filter(([, ok]) => !ok).map(([k]) => k);
    setErrors(Object.fromEntries(bad.map((k) => [k, true])));
    if (bad.length) return focusField(bad[0]);
    setBusy(true);
    try {
      const res = await api<{ id: string; token: string }>("POST", "/api/orders", {
        name: values.name, phone: values.phone, mode: cart.mode,
        address: deliv ? `${values.address.trim()} (${label})` : "", pincode: deliv ? values.pincode.trim() : "",
        payment, whatsapp, when: cart.when || "asap", note: cart.note, coupon: cart.coupon,
        items: cart.items.map((i) => ({ id: i.id, qty: i.qty, opts: i.opts })),
      });
      const mode = cart.mode;
      if (deliv) update({ pincode: values.pincode.trim() });
      setLastOrder({ id: res.id, token: res.token, mode, done: false });
      clearCart();
      openDialog({ kind: "track", id: res.id, token: res.token, mode, fresh: true });
    } catch (err) {
      setBusy(false);
      const field = err instanceof RequestError ? (err.field as Field | null) : null;
      if (field && ["name", "phone", "address", "pincode"].includes(field)) {
        setErrors((x) => ({ ...x, [field]: true }));
        focusField(field);
      }
      toast((err as Error).message, { error: true, duration: 6000 });
    }
  }

  const err = (k: Field) => (errors[k] ? "field has-error" : "field");
  return (
    <form className="dialog-body" onSubmit={submit} noValidate>
      <span className="eyebrow" style={{ color: "var(--ember)" }}>Checkout · {deliv ? "Delivery" : "Pickup"}</span>
      <h2 style={{ margin: "12px 0 22px" }}>Almost there</h2>
      <div className="row-2">
        <div className={err("name")}>
          <label htmlFor="co-name">Full name</label>
          <input ref={nameRef} className="input" id="co-name" autoComplete="name" value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={!!errors.name} />
          <span className="error-msg">Please enter your name</span>
        </div>
        <div className={err("phone")}>
          <label htmlFor="co-phone">Mobile number</label>
          <input ref={phoneRef} className="input" id="co-phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="10-digit mobile" value={values.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />
          <span className="error-msg">Enter a valid 10-digit Indian mobile number</span>
        </div>
      </div>
      {deliv ? (
        <>
          <div className={err("address")}>
            <label htmlFor="co-addr">Delivery address</label>
            <textarea ref={addressRef} className="textarea" id="co-addr" autoComplete="street-address" placeholder="Flat / house no., building, street, landmark" value={values.address} onChange={(e) => set("address", e.target.value)} aria-invalid={!!errors.address} />
            <span className="error-msg">Please add your address</span>
          </div>
          <div className="row-2">
            <div className={err("pincode")}>
              <label htmlFor="co-pin">Pincode</label>
              <input ref={pincodeRef} className="input" id="co-pin" inputMode="numeric" maxLength={6} value={values.pincode} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} aria-invalid={!!errors.pincode} />
              <span className="error-msg">Sorry — we don&apos;t deliver to this pincode yet. Try pickup!</span>
            </div>
            <div className="field">
              <span className="label">Save as</span>
              <div className="chips">
                {["Home", "Work", "Other"].map((l) => (
                  <button type="button" key={l} className="chip" aria-pressed={label === l} onClick={() => setLabel(l)}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="notice info"><StoreIcon size={20} /> Pickup from {brand.address}. Ready in about 25 minutes.</div>
      )}
      <div className="field">
        <span className="label">How will you pay?</span>
        <div className="chips">
          {payOptions.map((p) => (
            <button type="button" key={p} className="chip" aria-pressed={payment === p} onClick={() => setPayment(p)}>{p}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="checkbox"><input type="checkbox" checked={whatsapp} onChange={(e) => setWhatsapp(e.target.checked)} /> Send order updates on WhatsApp</label>
      </div>
      <div className="confirm-details" style={{ marginTop: 6 }}>
        <div><span>{count} item{count > 1 ? "s" : ""}</span><strong>{rupee(totals.subtotal)}</strong></div>
        {totals.discount > 0 && <div><span>Discount</span><strong style={{ color: "var(--leaf)" }}>−{rupee(totals.discount)}</strong></div>}
        <div><span>Fees &amp; GST</span><strong>{rupee(totals.delivery + totals.packaging + totals.gst)}</strong></div>
        <div><span>To pay</span><strong style={{ fontSize: 18 }}>{rupee(totals.total)}</strong></div>
      </div>
      <button className="btn btn-ember btn-block" type="submit" disabled={busy}>{busy ? "Placing your order…" : `Place order · ${rupee(totals.total)}`}</button>
      <p style={{ fontSize: 12, color: "var(--text-dark-dim)", textAlign: "center", margin: "12px 0 0" }}>Nothing is charged online — you pay when your order {deliv ? "arrives" : "is collected"}.</p>
    </form>
  );
}
