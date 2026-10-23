"use client";
import { useRef, useState } from "react";
import { reviews } from "@/lib/data";
import { ArrowLeft, ArrowRight } from "../icons";

export function Reviews() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const step = () => {
    const card = track.current?.firstElementChild as HTMLElement | null;
    return card ? card.getBoundingClientRect().width + 22 : 1;
  };
  const go = (i: number) => track.current?.scrollTo({ left: i * step(), behavior: "smooth" });
  const next = () => {
    const el = track.current;
    if (!el) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 5) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: step(), behavior: "smooth" });
  };

  return (
    <section className="section section-cream" id="reviews" aria-labelledby="reviews-title">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">Guest notes</span><h2 className="h-lg" id="reviews-title">Kind words from <span className="italic">our regulars</span></h2></div>
        </div>
        <div className="reviews-wrap">
          <div className="rating-summary reveal">
            <div>
              <div className="rating-big">4.8</div>
              <div className="rating-stars" role="img" aria-label="4.8 out of 5 stars">★★★★★</div>
              <p style={{ margin: "6px 0 0", color: "var(--text-dark-dim)", fontSize: 14 }}>from 3,600+ reviews</p>
            </div>
            <div className="rating-bars" aria-hidden="true">
              {[["5★", 84], ["4★", 11], ["3★", 3], ["2★", 1], ["1★", 1]].map(([s, p]) => (
                <div key={s}><span>{s}</span><span className="bar"><i style={{ width: `${p}%` }} /></span><span>{p}%</span></div>
              ))}
            </div>
            <div className="sources"><span>Google 4.8</span><span>Zomato 4.6</span><span>TripAdvisor 5.0</span></div>
          </div>
          <div>
            <div className="review-track" ref={track} tabIndex={0} aria-label="Guest reviews" onScroll={() => setActive(Math.min(reviews.length - 1, Math.round((track.current?.scrollLeft ?? 0) / step())))}>
              {reviews.map((r) => (
                <article className="review" key={r.name}>
                  <div className="rating-stars" role="img" aria-label={`${r.stars} out of 5 stars`}>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                  <p>“{r.text}”</p>
                  <footer>
                    <span className="avatar" aria-hidden="true">{r.name.charAt(0)}</span>
                    <span><strong>{r.name}</strong><small>{r.src} · {r.when}</small></span>
                  </footer>
                </article>
              ))}
            </div>
            <div className="reviews-controls">
              <div className="dots-nav">
                {reviews.map((_, i) => <button key={i} className={i === active ? "is-active" : ""} aria-label={`Go to review ${i + 1}`} onClick={() => go(i)} />)}
              </div>
              <div className="carousel-nav">
                <button className="round-btn" onClick={() => track.current?.scrollBy({ left: -step(), behavior: "smooth" })} aria-label="Previous review"><ArrowLeft size={20} /></button>
                <button className="round-btn" onClick={next} aria-label="Next review"><ArrowRight size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
