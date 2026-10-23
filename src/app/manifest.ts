import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ember & Saffron — Modern Indian Kitchen & Bar",
    short_name: "Ember & Saffron",
    description: "Book a table or order delivery from Ember & Saffron, Indiranagar.",
    start_url: "/",
    display: "standalone",
    background_color: "#140f0c",
    theme_color: "#140f0c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
