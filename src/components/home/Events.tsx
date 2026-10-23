"use client";
import Image from "next/image";
import Link from "next/link";
import { addDays, localISO } from "@/lib/hours";
import { IMG, type ImageName } from "@/lib/images";
import { ArrowRight } from "../icons";
import { useNow } from "../site/hooks";

/** Dates are relative to today, so they are worked out in the browser after the page loads. */
const EVENTS: { title: string; img: ImageName; time: string; price: string; seats: string; text: string; date: (today: Date) => string }[] = [
  { title: "Diwali Feast", img: "royal-thali", time: "7 pm onwards", price: "₹1,499 pp", seats: "18 seats left", text: "A seven-course festival menu with mithai trolley, live tandoor and a sparkler toast on the terrace.", date: (t) => addDays(localISO(t), 9) },
  { title: "Chef's Table", img: "fine-plate", time: "8 pm · 8 guests", price: "₹3,200 pp", seats: "3 seats left", text: "Sit at the pass with Chef Arjun for nine courses that change every week. Wine or zero-proof pairing available.", date: (t) => nextWeekday(t, 4) },
  { title: "Sunday Sadya", img: "sadya-thali", time: "12 – 4 pm", price: "₹749 pp", seats: "Walk-ins welcome", text: "Our fourteen-item Kerala feast on banana leaf, served with live mridangam and filter coffee.", date: (t) => nextWeekday(t, 0) },
];

function nextWeekday(today: Date, dow: number) {
  const diff = (dow - today.getDay() + 7) % 7 || 7;
  return addDays(localISO(today), diff);
}

export const RESERVE_DATE_EVENT = "es:reserve-date";

export function Events() {
  const now = useNow(60 * 60 * 1000);
  return (
    <section className="section" id="events" aria-labelledby="events-title">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">What&apos;s on</span><h2 className="h-lg" id="events-title">Evenings <span className="italic">worth planning</span></h2></div>
          <p className="lead">Seasonal feasts, live music and the Chef&apos;s Table. Small numbers — book early.</p>
        </div>
        <div className="events-grid">
          {EVENTS.map((ev, i) => {
            const iso = now ? ev.date(now) : null;
            const d = iso ? new Date(iso + "T00:00:00") : null;
            return (
              <article key={ev.title} className={`event reveal ${i ? "reveal-d" + i : ""}`}>
                <div className="event-media">
                  <Image src={IMG[ev.img]} alt="" sizes="(max-width: 860px) 100vw, 33vw" placeholder="blur" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div className="event-date" aria-hidden={!d}>
                    <strong>{d ? d.getDate() : "··"}</strong>
                    <span>{d ? d.toLocaleString("en-IN", { month: "short" }) : ""}</span>
                  </div>
                </div>
                <div className="event-body">
                  <h3>{ev.title}</h3>
                  <div className="event-meta"><span>{ev.time}</span><span>{ev.price}</span><span>{ev.seats}</span></div>
                  <p>{ev.text}</p>
                  <Link
                    className="link-arrow" href="/#reserve" style={{ alignSelf: "flex-start", marginTop: 8 }}
                    onClick={() => iso && window.dispatchEvent(new CustomEvent(RESERVE_DATE_EVENT, { detail: iso }))}
                  >
                    Reserve a seat <ArrowRight size={18} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
