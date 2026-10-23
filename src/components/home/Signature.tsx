"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { dishById, type Dish } from "@/lib/data";
import { ArrowLeft, ArrowRight } from "../icons";
import { DishCard } from "../site/dish-bits";

const IDS = ["butter-chicken", "dum-biryani", "seekh-kebab", "paneer-tikka", "malabar-fish", "royal-thali", "samosa-chaat", "shrikhand"];
const dishes = IDS.map((id) => dishById(id)).filter(Boolean) as Dish[];

export function Signature() {
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 5);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 5);
  }, []);
  useEffect(update, [update]);

  const step = (dir: number) => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (el && card) el.scrollBy({ left: dir * (card.getBoundingClientRect().width + 22), behavior: "smooth" });
  };

  return (
    <section className="section section-cream" aria-labelledby="sig-title">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">Signatures</span><h2 className="h-lg" id="sig-title">The dishes people <span className="italic">come back for</span></h2></div>
          <div className="carousel-nav">
            <button className="round-btn" onClick={() => step(-1)} disabled={atStart} aria-label="Previous dishes"><ArrowLeft size={20} /></button>
            <button className="round-btn" onClick={() => step(1)} disabled={atEnd} aria-label="Next dishes"><ArrowRight size={20} /></button>
          </div>
        </div>
        <div className="carousel" ref={track} onScroll={update} tabIndex={0} aria-label="Signature dishes, scroll horizontally">
          {dishes.map((d) => <DishCard key={d.id} dish={d} sizes="(max-width: 860px) 72vw, 300px" />)}
        </div>
      </div>
    </section>
  );
}
