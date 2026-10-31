"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IMG } from "@/lib/images";
import { ArrowDown, ArrowRight, PauseIcon, PlayIcon } from "../icons";
import { usePrefersReducedMotion } from "../site/hooks";
import { OpenStatus } from "../site/OpenStatus";

export function Hero() {
  const video = useRef<HTMLVideoElement>(null);
  const reduce = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // Respect reduced-motion and data-saver settings: show the still photo instead.
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData) {
      v.pause();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaying(false);
    }
    // Pause when this page is hidden (Next.js keeps visited pages mounted in the background).
    return () => v.pause();
  }, [reduce]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => {}); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media">
        <video ref={video} autoPlay muted loop playsInline preload="metadata" poster={IMG["hero-poster"].src} aria-hidden="true">
          <source src="/assets/video/hero-mobile.mp4" type="video/mp4" media="(max-width: 860px)" />
          <source src="/assets/video/hero.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="container hero-grid">
        <div>
          <div className="hero-badges">
            <span className="badge"><span className="stars">★★★★★</span> 4.8 · 2,140 Google reviews</span>
            <span className="badge"><OpenStatus /></span>
          </div>
          <span className="eyebrow">Modern Indian · Charcoal &amp; Tandoor · Demo Nagar</span>
          <h1 className="h-xl" id="hero-title" style={{ marginTop: 18 }}>
            Fire-kissed Indian, <span className="italic">made for long evenings.</span>
          </h1>
          <p className="lead">Smoky kebabs from a 480° clay oven, sealed-pot biryanis and curries from four regions — plated for sharing, poured with something cold.</p>
          <div className="hero-ctas">
            <Link className="btn" href="/#reserve">Book a table</Link>
            <Link className="btn btn-ghost" href="/menu">Order delivery</Link>
            <Link className="link-arrow" href="/#menu">Explore the menu <ArrowRight size={18} /></Link>
          </div>
        </div>
        <div className="hero-side">
          <button className="video-toggle" onClick={toggle} aria-pressed={!playing}>
            <span className="ico">{playing ? <PauseIcon size={14} /> : <PlayIcon size={14} />}</span>
            <span>{playing ? "Pause film" : "Play film"}</span>
          </button>
          <a href="#paths" className="scroll-cue" aria-label="Scroll down">
            <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
              <defs><path id="circ" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" /></defs>
              <text fontSize="9.4" letterSpacing="3.2" fill="#c4b5a3" fontFamily="var(--font-manrope)" fontWeight="700">
                <textPath href="#circ">SCROLL · TO · EXPLORE · SCROLL · TO · EXPLORE ·</textPath>
              </text>
            </svg>
            <ArrowDown className="arrow" />
          </a>
        </div>
      </div>
    </section>
  );
}
