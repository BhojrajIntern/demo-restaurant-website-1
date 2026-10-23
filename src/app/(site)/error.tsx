"use client";
import Link from "next/link";
import { useEffect } from "react";
import { brand } from "@/lib/data";

/** Shown if part of the website crashes — keeps the header/footer and offers ways forward. */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="section" style={{ minHeight: "70vh", display: "grid", placeItems: "center", textAlign: "center", paddingTop: 160 }}>
      <div className="container">
        <span className="eyebrow center">Something went wrong</span>
        <h1 className="h-lg" style={{ margin: "18px 0 14px" }}>The kitchen <span className="italic">dropped a plate</span></h1>
        <p className="lead" style={{ margin: "0 auto 28px" }}>
          Sorry — this page didn&apos;t load properly. Try again, or call us on {brand.phone} and we&apos;ll take your order or booking by phone.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn" onClick={() => retry()}>Try again</button>
          <Link className="btn btn-ghost" href="/">Back to home</Link>
          <a className="btn btn-ghost" href={brand.phoneHref}>Call {brand.phone}</a>
        </div>
      </div>
    </section>
  );
}
