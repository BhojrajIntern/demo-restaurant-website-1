/** Public address of the website (set NEXT_PUBLIC_SITE_URL when hosting, e.g. https://emberandsaffron.in). */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
