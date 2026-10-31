"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IMG } from "@/lib/images";
import { ArrowRight } from "../icons";
import { useShop, useUI } from "../site/store";

function CouponButton({ code }: { code: string }) {
  const { update } = useShop();
  const { toast } = useUI();
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard?.writeText(code); } catch { /* clipboard blocked — still apply */ }
        update({ coupon: code });
        setDone(true);
        toast(`${code} copied & applied to your order`);
      }}
    >
      {done ? "Applied ✓" : "Copy & apply"}
    </button>
  );
}

export function Offers() {
  return (
    <section className="section" id="offers" aria-labelledby="offers-title" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="offers-grid">
          <article className="offer has-img reveal" suppressHydrationWarning>
            <Image className="bg" src={IMG["north-thali"]} alt="" fill sizes="(max-width: 560px) 100vw, 45vw" />
            <div>
              <span className="offer-kicker" style={{ color: "var(--saffron)" }}>Tue – Fri · 12–3:30 pm</span>
              <h3 id="offers-title">Weekday Lunch Thali — ₹499</h3>
              <p>Two curries, dal, rice, roti, salad and a sweet. Changes every day, in and out in 45 minutes.</p>
            </div>
            <Link className="link-arrow" href="/#reserve" style={{ color: "var(--cream)" }}>Reserve lunch <ArrowRight size={18} /></Link>
          </article>
          <article className="offer saffron reveal reveal-d1" suppressHydrationWarning>
            <div><span className="offer-kicker">First online order</span><h3>15% off, straight from our kitchen</h3><p>Valid on delivery &amp; pickup. No minimum.</p></div>
            <div className="coupon"><span>EMBER15</span><CouponButton code="EMBER15" /></div>
          </article>
          <article className="offer ember reveal reveal-d2" suppressHydrationWarning>
            <div><span className="offer-kicker">Every day · 4–7 pm</span><h3>Golden Hour</h3><p>House cocktails &amp; kokum coolers at ₹299, with half-price samosa chaat at the bar.</p></div>
            <div className="coupon"><span>FEAST100</span><CouponButton code="FEAST100" /></div>
          </article>
        </div>
      </div>
    </section>
  );
}
