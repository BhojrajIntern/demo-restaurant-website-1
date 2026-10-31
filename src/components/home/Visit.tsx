"use client";
import { brand, hours } from "@/lib/data";
import { dayNames, fmtClose, fmtTime, restaurantNow } from "@/lib/hours";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "../icons";
import { useNow } from "../site/hooks";
import { OpenStatus } from "../site/OpenStatus";

/** Illustrated, fictional map — deliberately not a real location. */
function MapCard() {
  return (
    <div className="visit-map reveal" suppressHydrationWarning>
      <div className="map-art" aria-hidden="true">
        <span className="park" style={{ left: -40, top: -30, width: 240, height: 200 }} />
        <span className="park" style={{ right: -60, bottom: -50, width: 260, height: 220 }} />
        <span className="road main" style={{ left: 0, right: 0, top: "44%", height: 14 }} />
        <span className="road main" style={{ top: 0, bottom: 0, left: "60%", width: 12, transform: "rotate(8deg)" }} />
        <span className="road" style={{ left: 0, right: 0, top: "20%", height: 7 }} />
        <span className="road" style={{ left: 0, right: 0, top: "72%", height: 7 }} />
        <span className="road" style={{ top: 0, bottom: 0, left: "22%", width: 7 }} />
        <span className="road" style={{ top: 0, bottom: 0, left: "84%", width: 7 }} />
        <span className="lbl" style={{ left: 24, top: "calc(44% + 22px)" }}>Sample Main Road</span>
        <span className="lbl" style={{ left: "calc(60% + 22px)", top: "14%" }}>Example Street</span>
        <span className="lbl" style={{ right: 24, bottom: 24 }}>Demo Metro</span>
      </div>
      <div className="map-pin" role="img" aria-label="Illustrative map — fictional location"><span className="pin-dot" /><span className="pin-label">Ember &amp; Saffron</span></div>
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
          <div><span className="eyebrow">Visit us</span><h2 className="h-lg" id="visit-title">Find us on <span className="italic">Example Street</span></h2></div>
          <p className="lead">Two minutes&apos; walk from Demo Metro (fictional). Valet parking from 7 pm.</p>
        </div>
        <div className="visit-grid">
          <MapCard />
          <div className="visit-card reveal reveal-d1" suppressHydrationWarning>
            <div>
              <h3>Ember &amp; Saffron, Demo Nagar</h3>
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
          </div>
        </div>
      </div>
    </section>
  );
}
