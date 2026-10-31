/* Homepage sections without interactivity (rendered on the server, zero JavaScript). */
import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/data";
import { IMG } from "@/lib/images";
import { ArrowRight } from "../icons";
import { CountUp } from "./CountUp";

const DISHES = ["Charcoal Tandoor", "Hyderabadi Dum Biryani", "Malabar Coast Curries", "Old Delhi Butter Chicken", "Sunday Sadya", "Kokum & Gin"];

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {[...DISHES, ...DISHES].map((d, i) => <span key={i}>{d}</span>)}
      </div>
    </div>
  );
}

const PATHS = [
  { href: "/#reserve", img: IMG["interior-main"], num: "01 — DINE IN", title: "Reserve a table", text: "Lunch Tue–Sun, dinner every night until late. Terrace, bar & chef's counter.", cta: "Book now" },
  { href: "/menu", img: IMG["dum-biryani"], num: "02 — DELIVERY & PICKUP", title: "Order online", text: "Straight from our kitchen, no aggregator markup. Ready in 25 minutes for pickup.", cta: "Start your order" },
  { href: "/#private", img: IMG.guests, num: "03 — CELEBRATIONS", title: "Private dining", text: "Birthdays, offsites and weddings for 12–120 guests, or our kitchen at your venue.", cta: "Plan an event" },
];

export function Paths() {
  return (
    <section className="paths" id="paths" aria-label="How would you like to dine?">
      <div className="container paths-grid">
        {PATHS.map((p, i) => (
          <Link key={p.href} className={`path-card reveal ${i ? "reveal-d" + i : ""}`} href={p.href}>
            <Image className="bg" src={p.img} alt="" fill sizes="(max-width: 860px) 100vw, 33vw" />
            <div><span className="path-num">{p.num}</span><h3>{p.title}</h3><p>{p.text}</p></div>
            <span className="link-arrow">{p.cta} <ArrowRight size={18} /></span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Story() {
  return (
    <section className="section section-light" id="story" aria-labelledby="story-title">
      <div className="container story-grid">
        <div className="story-collage reveal">
          <Image className="c1" src={IMG["interior-hall"]} alt="The warm, wood-panelled main dining hall at Ember & Saffron" sizes="(max-width: 860px) 80vw, 40vw" placeholder="blur" />
          <Image className="c2" src={IMG["chef-chopping"]} alt="A cook finely chopping fresh herbs" sizes="(max-width: 860px) 50vw, 25vw" />
          <div className="stamp"><span><strong>2019</strong>Since</span></div>
        </div>
        <div className="story-copy reveal reveal-d1">
          <span className="eyebrow">Our story</span>
          <h2 className="h-lg" id="story-title">Four regions. <span className="italic">One fire.</span></h2>
          <p>Ember &amp; Saffron began with a single charcoal tandoor and a notebook of family recipes collected between Old Delhi, Hyderabad, Chettinad and the Malabar coast.</p>
          <p>We still grind our masalas every morning, marinate overnight and cook over live coal — because some flavours simply can&apos;t be rushed. The room is warm, the music is low, and the kitchen stays open late.</p>
          <div className="stats">
            <div className="stat"><strong><CountUp end={42} /></strong><span>spices ground in-house daily</span></div>
            <div className="stat"><strong><CountUp end={480} suffix="°" /></strong><span>charcoal tandoor heat</span></div>
            <div className="stat"><strong><CountUp end={18} suffix="h" /></strong><span>dal simmered on embers</span></div>
          </div>
          <p className="signature">— Chef Arjun Menon &amp; the Ember family</p>
        </div>
      </div>
    </section>
  );
}

export function Chef() {
  return (
    <section className="section" id="chef" aria-labelledby="chef-title" style={{ paddingTop: "clamp(40px,6vw,80px)" }}>
      <div className="container chef-grid">
        <div className="chef-photo reveal">
          <Image src={IMG["chef-plating"]} alt="Chef Arjun Menon plating a dish under copper lamps" sizes="(max-width: 860px) 100vw, 45vw" placeholder="blur" />
          <div className="caption"><div><strong>Arjun Menon</strong><span>Chef &amp; co-founder</span></div><span>14 years · Delhi · Kochi · London</span></div>
        </div>
        <div className="reveal reveal-d1">
          <span className="eyebrow" id="chef-title">Meet the chef</span>
          <blockquote className="chef-quote">I cook the food I grew up eating — just with more patience, better coal and a few late nights of tasting.</blockquote>
          <ul className="chef-points">
            <li>Trained under masters of Awadhi and Kerala cooking before opening Ember &amp; Saffron.</li>
            <li>Sources heirloom rice from Wayanad and Kashmiri chillies directly from growers.</li>
            <li>Hosts the eight-seat Chef&apos;s Table every Thursday — a menu that changes weekly.</li>
          </ul>
          <Link className="btn btn-ghost" href="/#events">Book the Chef&apos;s Table</Link>
          <div className="awards" style={{ marginTop: 40 }} aria-label="Awards and press">
            <div className="award"><strong>Best Modern Indian</strong><span>City Food Awards 2025</span></div>
            <div className="award"><strong>Top 30 Restaurants</strong><span>Bengaluru Eats Guide 2024</span></div>
            <div className="award"><strong>“A smoky triumph”</strong><span>The Weekend Table</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS: [string, string][] = [
  ["Do you cater to allergies and dietary needs?", "Yes. Every dish on our menu lists its major allergens, and roughly half the menu is vegetarian. Tell your server about any allergy — our kitchen handles nuts, dairy and gluten, so we can't guarantee zero cross-contact."],
  ["Is there a dress code?", "Smart casual. Come as you are for lunch; most guests dress up a little in the evening."],
  ["Are children welcome?", "Absolutely. We have high chairs, a small kids' menu and crayons. The terrace is adults-only after 9 pm on Fridays and Saturdays."],
  ["How far do you deliver?", "Around 6 km from Demo Nagar, including the neighbouring areas. Enter your pincode on the order page to check."],
  ["Can I change or cancel my booking?", "Yes — use the link in your confirmation or call us. Cancellations are free up to 2 hours before your booking. Large-group bookings require 48 hours' notice."],
  ["Do you serve alcohol?", "We have a full bar with regional craft gins, Indian single malts and a seasonal cocktail list, plus plenty of zero-proof coolers."],
];

export function Faq() {
  return (
    <section className="section section-light" id="faq" aria-labelledby="faq-title">
      <div className="container faq-grid">
        <div className="reveal">
          <span className="eyebrow">Good to know</span>
          <h2 className="h-lg" id="faq-title" style={{ margin: "16px 0 20px" }}>Questions, <span className="italic">answered</span></h2>
          <p className="lead">Still curious? Call or WhatsApp us — a real person answers between 11 am and 11 pm.</p>
          <a className="btn btn-dark" href={`https://wa.me/${brand.whatsappNumber}`} target="_blank" rel="noopener noreferrer" style={{ marginTop: 12 }}>Chat on WhatsApp</a>
        </div>
        <div className="faq reveal reveal-d1">
          {FAQS.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>{q}<span className="pm" aria-hidden="true">+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
