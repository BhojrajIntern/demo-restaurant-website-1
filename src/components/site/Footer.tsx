import Link from "next/link";
import { brand } from "@/lib/data";
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from "../icons";
import { OpenStatus } from "./OpenStatus";
import { Logo } from "./SiteChrome";
import { CopyrightYear } from "./CopyrightYear";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>Charcoal, clay ovens and slow-cooked curries from four corners of India — served late in the heart of Demo Nagar.</p>
            <div className="socials">
              <a href="#" aria-label="Instagram"><InstagramIcon size={18} /></a>
              <a href="#" aria-label="Facebook"><FacebookIcon size={18} /></a>
              <a href="#" aria-label="YouTube"><YouTubeIcon size={18} /></a>
              <a href={brand.whatsapp} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={18} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link href="/menu">Order online</Link></li>
              <li><Link href="/#menu">Menu</Link></li>
              <li><Link href="/#reserve">Reservations</Link></li>
              <li><Link href="/#private">Private dining &amp; catering</Link></li>
              <li><Link href="/#events">What&apos;s on</Link></li>
              <li><Link href="/#gallery">Gallery</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Visit</h4>
            <ul>
              <li>{brand.address}</li>
              <li><a href={brand.phoneHref}>{brand.phone}</a></li>
              <li><a href={`mailto:${brand.email}`}>{brand.email}</a></li>
              <li><OpenStatus /></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><Link href="/#faq">FAQs</Link></li>
              <li><Link href="/legal#allergens">Allergens &amp; nutrition</Link></li>
              <li><Link href="/legal#refunds">Cancellations &amp; refunds</Link></li>
              <li><Link href="/#private">Gift cards</Link></li>
              <li><a href={`mailto:${brand.email}?subject=Careers`}>Careers</a></li>
              <li><Link href="/legal#accessibility">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-big" aria-hidden="true">Ember &amp; Saffron</div>
        <div className="footer-bottom">
          <span>
            © <CopyrightYear /> Ember &amp; Saffron Hospitality.{" "}
            <span className="demo-note">Demo website — all content fictional. Photos: Unsplash · Video: Mixkit.</span>
          </span>
          <div className="pay-icons" aria-label="Accepted payments"><span>UPI</span><span>VISA</span><span>MASTERCARD</span><span>RUPAY</span><span>AMEX</span></div>
          <ul>
            <li><Link href="/legal#privacy">Privacy</Link></li>
            <li><Link href="/legal#terms">Terms</Link></li>
            <li><Link href="/legal#cookies">Cookies</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
