"use client";
import { useEffect, useRef, useState } from "react";
import { IMG } from "@/lib/images";

/** Muted kitchen film that plays while on screen (unless the visitor prefers reduced motion). */
export function KitchenFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!v || !("IntersectionObserver" in window) || saveData || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().then(() => setPlaying(true)).catch(() => {});
      else { v.pause(); setPlaying(false); }
    }, { threshold: 0.4 });
    io.observe(v);
    return () => { io.disconnect(); v.pause(); };
  }, []);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else { v.pause(); setPlaying(false); }
  };

  return (
    <section className="section" aria-labelledby="film-title" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="film reveal" suppressHydrationWarning>
          <video ref={video} muted loop playsInline preload="none" poster={IMG["seekh-grill"].src}>
            <source src="/assets/video/kitchen-mobile.mp4" type="video/mp4" media="(max-width: 860px)" />
            <source src="/assets/video/kitchen.mp4" type="video/mp4" />
          </video>
          <div className="film-overlay">
            <div className="row">
              <div><span className="eyebrow">Behind the pass</span><h2 className="h-lg" id="film-title" style={{ marginTop: 14 }}>Inside our <span className="italic">kitchen</span></h2></div>
              <button className="btn btn-ghost" onClick={toggle}>{playing ? "❚❚  Pause film" : "▶  Play film"}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
