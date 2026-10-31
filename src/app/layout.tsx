import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-fraunces", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Ember & Saffron — Modern Indian Kitchen & Bar, Demo Nagar", template: "%s — Ember & Saffron" },
  description: "Charcoal tandoor, dum biryanis and slow-cooked regional curries in Demo Nagar, Bengaluru. Book a table, order delivery or plan a private dinner.",
  applicationName: "Ember & Saffron",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Ember & Saffron",
    locale: "en_IN",
    title: "Ember & Saffron — Modern Indian Kitchen & Bar",
    description: "Fire-kissed Indian food, made for long evenings. Book a table or order delivery in Demo Nagar.",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#140f0c", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
