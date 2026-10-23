import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IMG } from "@/lib/images";

export const metadata: Metadata = { title: "Policies", description: "Allergens, cancellations, privacy, terms, cookies and accessibility at Ember & Saffron.", alternates: { canonical: "/legal" } };

export default function LegalPage() {
  return (
    <div className="menu-page">
      <section className="page-hero">
        <Image className="bg" src={IMG["interior-window"]} alt="" fill priority sizes="100vw" />
        <div className="container">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Policies</span></nav>
          <h1 className="h-lg">Policies &amp; <span className="italic">guest information</span></h1>
          <p className="lead">Demo content for a fictional restaurant. Replace with your own legal text before going live.</p>
        </div>
      </section>
      <div className="container legal">
        <h2 id="allergens">Allergens &amp; nutrition</h2>
        <p>Every dish lists the major allergens it contains (gluten, dairy, nuts, fish, shellfish, egg, soy, sesame). Our kitchen handles all of them, so we cannot guarantee a dish is free from traces. Please tell us about allergies when booking or in the kitchen note at checkout.</p>
        <p>Vegetarian dishes carry a green mark; non-vegetarian dishes a brown mark. Calorie information is available on request.</p>
        <h2 id="refunds">Cancellations &amp; refunds</h2>
        <p>Table bookings can be cancelled free of charge up to 2 hours before. Groups of 9+ need 48 hours&apos; notice. Online orders can be cancelled until the kitchen starts preparing them; refunds return to the original payment method within 5–7 working days.</p>
        <h2 id="privacy">Privacy policy</h2>
        <p>We collect only what we need to take your booking or order (name, phone, email, address) and, if you opt in, to send our newsletter. We never sell your data. Contact hello@emberandsaffron.demo to access or delete your information.</p>
        <h2 id="terms">Terms &amp; conditions</h2>
        <p>Prices are in Indian Rupees and exclude 5% GST. Offers cannot be combined unless stated. Delivery times are estimates.</p>
        <h2 id="cookies">Cookies</h2>
        <p>We use essential storage to remember your order, dismissed banners and cookie choice. Optional analytics cookies are only set if you choose “Accept all”.</p>
        <h2 id="accessibility">Accessibility</h2>
        <p>This site aims to meet WCAG 2.2 AA: keyboard navigation, visible focus, skip links, text alternatives for images, pause controls for video and support for reduced motion. The restaurant has a step-free entrance and an accessible restroom. Tell us how we can help.</p>
        <p style={{ marginTop: 40 }}><Link className="btn btn-dark" href="/">Back to home</Link></p>
      </div>
    </div>
  );
}
