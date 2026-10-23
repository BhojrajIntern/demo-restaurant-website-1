"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IMG, type ImageName } from "@/lib/images";
import { ArrowLeft, ArrowRight, CloseIcon } from "../icons";
import { useScrollLock } from "../site/hooks";

const PHOTOS: [ImageName, string][] = [
  ["interior-main", "The main dining hall"], ["butter-chicken", "Old Delhi butter chicken"], ["bar", "The Ember bar"],
  ["tandoori-chicken", "Tandoori chicken & naan"], ["table-spread", "Sunday brunch spread"], ["royal-thali", "The Royal Thali"],
  ["terrace", "The terrace at golden hour"], ["kahwa", "Kashmiri kahwa"], ["interior-window", "The Saffron Room"],
  ["sadya-thali", "Sunday sadya on banana leaf"], ["guests", "A long table on Friday night"], ["fine-plate", "Chef's Table course"],
];

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const returnTo = useRef<HTMLButtonElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef(0);
  useScrollLock(open !== null);

  const show = (i: number) => setOpen(((i % PHOTOS.length) + PHOTOS.length) % PHOTOS.length);
  const close = () => { setOpen(null); returnTo.current?.focus(); };

  useEffect(() => {
    if (open === null) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(open - 1);
      if (e.key === "ArrowRight") show(open + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <section className="section section-light" id="gallery" aria-labelledby="gallery-title">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">Gallery</span><h2 className="h-lg" id="gallery-title">A table, <span className="italic">set for you</span></h2></div>
          <p className="lead">The dining hall, the bar, the terrace and a few plates worth photographing. Tag us <strong>@emberandsaffron</strong>.</p>
        </div>
        <div className="gallery">
          {PHOTOS.map(([img, caption], i) => (
            <button key={img} data-caption={caption} aria-label={`Open photo: ${caption}`} onClick={(e) => { returnTo.current = e.currentTarget; show(i); }}>
              <Image src={IMG[img]} alt={caption} sizes="(max-width: 860px) 50vw, 25vw" placeholder="blur" style={{ height: "auto" }} />
            </button>
          ))}
        </div>
      </div>

      {open !== null && (
        <div
          className="lightbox is-open" role="dialog" aria-modal="true" aria-label="Photo viewer"
          onClick={(e) => e.target === e.currentTarget && close()}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) show(open + (dx < 0 ? 1 : -1)); }}
        >
          <button ref={closeBtn} className="icon-btn round-btn light lb-close" onClick={close} aria-label="Close"><CloseIcon size={20} /></button>
          <button className="round-btn light lb-prev" onClick={() => show(open - 1)} aria-label="Previous photo"><ArrowLeft size={20} /></button>
          <figure>
            <Image src={IMG[PHOTOS[open][0]]} alt={PHOTOS[open][1]} sizes="90vw" style={{ width: "auto", maxWidth: "100%" }} />
            <figcaption>{PHOTOS[open][1]} — {open + 1} / {PHOTOS.length}</figcaption>
          </figure>
          <button className="round-btn light lb-next" onClick={() => show(open + 1)} aria-label="Next photo"><ArrowRight size={20} /></button>
        </div>
      )}
    </section>
  );
}
