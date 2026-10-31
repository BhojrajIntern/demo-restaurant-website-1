import { CartDrawer } from "@/components/site/CartDrawer";
import { DialogHost } from "@/components/site/DialogHost";
import { Footer } from "@/components/site/Footer";
import { ActionBar, Announcement, BackToTop, CookieBanner, Header, RevealObserver, Toasts, TrackPill } from "@/components/site/SiteChrome";
import { SiteProviders } from "@/components/site/store";
import { brand } from "@/lib/data";
import { siteUrl } from "@/lib/site";

/** Public website: header, footer, cart and dialogs shared by every page. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteProviders>
      <a className="skip-link" href="#main">Skip to content</a>
      <Announcement />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer />
      <DialogHost />
      <ActionBar />
      <TrackPill />
      <BackToTop />
      <CookieBanner />
      <Toasts />
      <RevealObserver />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: brand.name,
            servesCuisine: ["Indian", "North Indian", "South Indian"],
            priceRange: "₹₹₹",
            telephone: brand.phone,
            address: { "@type": "PostalAddress", streetAddress: brand.streetAddress, addressLocality: brand.city, postalCode: brand.postalCode, addressCountry: "IN" },
            acceptsReservations: "True",
            url: siteUrl,
            menu: `${siteUrl}/menu`,
            image: `${siteUrl}/opengraph-image.jpg`,
            openingHours: ["Mo 19:00-23:00", "Tu-Th 12:00-15:30", "Tu-Th 19:00-23:00", "Fr 12:00-15:30", "Fr 19:00-23:59", "Sa 12:00-16:00", "Sa 19:00-23:59", "Su 12:00-16:00", "Su 19:00-23:30"],
          }),
        }}
      />
    </SiteProviders>
  );
}
