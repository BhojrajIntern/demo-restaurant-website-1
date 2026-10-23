"use client";
import { useEffect, useRef, useState } from "react";
import { brand, hours } from "@/lib/data";
import { dayNames, fmtClose, fmtTime, restaurantNow } from "@/lib/hours";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "../icons";
import { useNow } from "../site/hooks";
import { OpenStatus } from "../site/OpenStatus";

/** Illustrated map; the live OpenStreetMap embed loads when the section scrolls into view. */
function MapCard() {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setLive(true); io.disconnect(); } });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="visit-map reveal" ref={box}>
      <div className="map-art" aria-hidden="true">
        <span className="park" style={{ left: -40, top: -30, width: 240, height: 200 }} />
        <span className="park" style={{ right: -60, bottom: -50, width: 260, height: 220 }} />
        <span className="road main" style={{ left: 0, right: 0, top: "44%", height: 14 }} />
        <span className="road main" style={{ top: 0, bottom: 0, left: "60%", width: 12, transform: "rotate(8deg)" }} />
        <span className="road" style={{ left: 0, right: 0, top: "20%", height: 7 }} />
        <span className="road" style={{ left: 0, right: 0, top: "72%", height: 7 }} />
        <span className="road" style={{ top: 0, bottom: 0, left: "22%", width: 7 }} />
        <span className="road" style={{ top: 0, bottom: 0, left: "84%", width: 7 }} />
        <span className="lbl" style={{ left: 24, top: "calc(44% + 22px)" }}>100 Feet Road</span>
        <span className="lbl" style={{ left: "calc(60% + 22px)", top: "14%" }}>12th Main</span>
        <span className="lbl" style={{ right: 24, bottom: 24 }}>Indiranagar Metro ↗</span>
      </div>
      {live ? (
        <iframe title="Map showing Ember & Saffron in Indiranagar, Bengaluru" loading="lazy"
          src="https://www.openstreetmap.org/export/embed.html?bbox=77.6362%2C12.9689%2C77.6462%2C12.9749&layer=mapnik&marker=12.9719%2C77.6412" />
      ) : (
        <div className="map-pin"><span className="pin-dot" /><span className="pin-label">Ember &amp; Saffron</span></div>
      )}
      <a className="btn btn-sm map-open" href={brand.mapsHref} target="_blank" rel="noopener noreferrer">Open in maps ↗</a>
    </div>
  );
}

export function Visit() {
  const now = useNow();
  const today = now ? restaurantNow(now).day : -1;
  return (
    <section className="section" id="visit" aria-labelledby="visit-title">
      <div className="container">
        <div className="section-head">
          <div><span className="eyebrow">Visit us</span><h2 className="h-lg" id="visit-title">Find us on <span className="italic">12th Main</span></h2></div>
          <p className="lead">Two minutes&apos; walk from Indiranagar metro. Valet parking from 7 pm.</p>
        </div>
        <div className="visit-grid">
          <MapCard />
          <div className="visit-card reveal reveal-d1">
            <div>
              <h3>Ember &amp; Saffron, Indiranagar</h3>
              <p className="muted" style={{ margin: "8px 0 0" }}>{brand.address}</p>
            </div>
            <div>
              <p style={{ fontWeight: 700, margin: "0 0 6px" }}><OpenStatus /></p>
              <table className="hours-table" aria-label="Opening hours">
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                    <tr key={d} className={d === today ? "is-today" : ""}>
                      <th scope="row">{dayNames[d]}{d === today ? " · today" : ""}</th>
                      <td>{hours[d].map(([o, c]) => `${fmtTime(o)} – ${fmtClose(c)}`).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="contact-list">
              <a href={brand.phoneHref}><PhoneIcon size={20} />{brand.phone}</a>
              <a href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={20} />WhatsApp us</a>
              <a href={`mailto:${brand.email}`}><MailIcon size={20} />{brand.email}</a>
            </div>
            <div className="visit-meta">
              <div><strong>Parking</strong>Valet from 7 pm</div>
              <div><strong>Access</strong>Step-free entrance</div>
              <div><strong>Dress</strong>Smart casual</div>
            </div>
            <a className="btn btn-block" href={brand.mapsHref} target="_blank" rel="noopener noreferrer">Get directions</a>
          </div>
        </div>
      </div>
    </section>
  );
}
