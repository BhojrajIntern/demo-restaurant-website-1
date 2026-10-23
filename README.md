# Ember & Saffron — Next.js restaurant website + manager dashboard

A fictional modern Indian restaurant (Indiranagar, Bengaluru) built with **Next.js 16 (App Router), React 19
and TypeScript**. One project contains the customer website, the API and the manager dashboard.

## Run it

```bash
cd web
npm install        # first time only
npm run dev        # development, with live reload → http://localhost:3000
```

| Who | Open |
|---|---|
| Customer website | http://localhost:3000 |
| Order online | http://localhost:3000/menu |
| Manager dashboard | http://localhost:3000/admin — development password `ember-admin` |

**Production / hosting:** see **[DEPLOY.md](DEPLOY.md)** (Docker + PostgreSQL, Vercel + Neon, Render/Railway or a plain VPS).
In production the demo password is refused — set `ADMIN_PASSWORD` (10+ characters) or the dashboard stays locked.

```bash
cp .env.example .env.production   # set NEXT_PUBLIC_SITE_URL, ADMIN_PASSWORD, DATABASE_URL
npm run build && npm start        # production server on http://localhost:3000
```

Data is stored in **PostgreSQL** when `DATABASE_URL` is set, otherwise in `data/db.json`.

## How it works

```
 Customer (browser)            Next.js server (this project)            Manager (browser)
 /, /menu  ── order/booking ─▶  src/app/api/*  checks prices & stock  ◀── /admin (password)
           ◀── live status ───  data/db.json   saves everything       ─── accept / prepare / deliver
```

- Prices are recalculated on the server from `src/lib/data.ts` — a customer can't change what they pay.
- Sold-out dishes, out-of-area pincodes and full time slots are rejected by the server.
- The dashboard checks for new data every 5 seconds, plays a chime for new orders, and the customer's
  tracking screen updates when the manager changes an order's status.

## Project structure

```
web/
├─ data/                     db.json when no DATABASE_URL is set — created automatically, not in git
├─ public/assets/video/      hero and kitchen films
├─ src/
│  ├─ app/
│  │  ├─ (site)/             public website: layout (header, footer, cart), /, /menu, /legal
│  │  ├─ admin/              manager dashboard page + admin.css
│  │  ├─ api/                API routes (orders, reservations, enquiries, subscribe, admin/*)
│  │  ├─ globals.css         the design system (colours, fonts, components)
│  │  └─ layout.tsx          fonts, page titles, metadata
│  ├─ assets/img/            photos (resized and converted to WebP/AVIF automatically)
│  ├─ components/
│  │  ├─ home/               homepage sections (Hero, MenuPreview, Reservation, Gallery…)
│  │  ├─ menu/               order-online page
│  │  ├─ site/               shared: cart drawer, dialogs, header, footer, cart state (store.tsx)
│  │  └─ admin/              dashboard views, order drawer
│  └─ lib/
│     ├─ data.ts             ⭐ menu, prices, hours, coupons, reviews — edit this to change content
│     ├─ pricing.ts          totals, GST, coupons (shared by browser and server)
│     ├─ hours.ts            opening hours, booking slots
│     └─ server/             storage (Postgres / file), login, rate limits, business rules
├─ .env.example              settings template
├─ Dockerfile, docker-compose.yml   production containers
└─ DEPLOY.md                 hosting guide
```

## Where to change things

| To change… | Edit |
|---|---|
| Dishes, prices, categories, photos per dish | `src/lib/data.ts` |
| Opening hours, delivery pincodes, fees, coupons | `src/lib/data.ts` |
| Colours, fonts, spacing | `:root` at the top of `src/app/globals.css` |
| Homepage text and sections | `src/components/home/*` and `src/app/(site)/page.tsx` |
| Photos | add to `src/assets/img/`, register in `src/lib/images.ts` |

## Try it

- Coupons: `EMBER15` (15% off) and `FEAST100` (₹100 off above ₹999)
- Delivery pincodes: 560038, 560008, 560017, 560071, 560075, 560093, 560102, 560001, 560025
- 9+ guests switches to a group enquiry; each booking slot takes 6 reservations

## Before using this for a real restaurant

See the checklist in [DEPLOY.md](DEPLOY.md): replace the fictional reviews, awards and legal text, set your real
contact details, and consider adding online payments and SMS/WhatsApp notifications.

Photos: Unsplash · Videos: Mixkit · Fonts: Fraunces & Manrope. All names, reviews, awards and prices are fictional.
