# Deploying Ember & Saffron

This guide takes the site from your computer to the internet. Pick **one** hosting option below.

---

## 1. Before you deploy — checklist

### Settings (environment variables)

| Variable | Required? | What it is |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Your public address, e.g. `https://www.emberandsaffron.in`. Must be set **before building** (it is written into the pages, sitemap and social previews). |
| `ADMIN_PASSWORD` | **Yes** | Password for `/admin`. At least 10 characters and not `ember-admin` — otherwise the dashboard stays **locked** in production. |
| `DATABASE_URL` | Yes on Vercel/serverless; recommended everywhere | PostgreSQL connection string. Without it, data is saved to `data/db.json` (only OK on one server with a permanent disk). |
| `ADMIN_SESSION_SECRET` | Optional | 32+ random characters for signing logins. If empty, it's derived from the password. |
| `DATA_DIR` | Optional | Where `db.json` is stored when not using Postgres (default `./data`). |

Generate a strong password/secret: `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`

> **Windows tip:** if you create `.env.local` / `.env.production` in Notepad, save it as **UTF-8** (not "UTF-8 with BOM"), otherwise the first line is ignored.

### Content — replace the demo before going live with a real business

The demo content is fictional. Before real customers see the site, update:

- `src/lib/data.ts` — restaurant name, phone, WhatsApp, email, address, map link, hours, menu, prices, coupons, delivery pincodes.
- **Reviews and awards** (`src/lib/data.ts` → `reviews`, and the awards in `src/components/home/StaticSections.tsx`): replace with **real** reviews/awards or remove them. Publishing invented reviews for a real restaurant is misleading and in many countries illegal.
- `src/app/(site)/legal/page.tsx` — your real privacy policy, terms and refund policy (take advice for your country, e.g. India's DPDP Act).
- Footer "Demo website" note in `src/components/site/Footer.tsx`.
- Photos in `src/assets/img/` (current ones are free Unsplash photos — fine to keep, but your own food photos are better).
- Social links (`#` placeholders) in `src/components/site/Footer.tsx`.

---

## 2. Hosting options

### Option A — Your own server (VPS) with Docker *(recommended: full control, ~₹500–1,000/month)*

Works on DigitalOcean, Hetzner, AWS Lightsail, Hostinger VPS, etc. Includes a PostgreSQL database.

1. Point your domain's **A record** to the server's IP.
2. On the server (Ubuntu): install Docker → `curl -fsSL https://get.docker.com | sh`
3. Copy the `web` folder to the server (git clone or `scp`).
4. In the `web` folder create a file named `.env`:
   ```
   SITE_URL=https://www.your-restaurant.com
   ADMIN_PASSWORD=<a long secret>
   POSTGRES_PASSWORD=<another long secret>
   ```
5. Start everything: `docker compose up -d --build`
6. Add HTTPS with Caddy (automatic free certificates). Install Caddy, then `/etc/caddy/Caddyfile`:
   ```
   www.your-restaurant.com, your-restaurant.com {
     reverse_proxy 127.0.0.1:3000
   }
   ```
   `sudo systemctl reload caddy`
7. Updating later: pull the new code, then `docker compose up -d --build`.

### Option B — Vercel + Neon (free tiers available, no server to manage)

1. Create a free PostgreSQL database at [neon.tech](https://neon.tech) (or Supabase). Copy the **pooled** connection string.
2. Push the `web` folder to a GitHub repository.
3. On [vercel.com](https://vercel.com): **Add New → Project →** import the repo. If the repo contains more than the `web` folder, set **Root Directory** to `web`.
4. **Environment Variables:** `NEXT_PUBLIC_SITE_URL`, `ADMIN_PASSWORD`, `DATABASE_URL`.
5. Deploy, then add your domain under **Settings → Domains**.

The tables are created automatically on the first request. (Vercel can't store files, so `DATABASE_URL` is mandatory there — the site refuses to start saving orders without it.)

### Option C — Render / Railway (managed containers)

1. Create a PostgreSQL database in the dashboard; copy its internal connection URL.
2. Create a **Web Service** from your Git repo, root directory `web`, using the **Dockerfile**.
3. Environment variables: `NEXT_PUBLIC_SITE_URL` (also as a *build* variable), `ADMIN_PASSWORD`, `DATABASE_URL`.
4. Health check path: `/api/health`.

### Option D — Plain Node.js on a server (no Docker)

Requires Node.js 20.9+ (22 or newer recommended).

```bash
cd web
npm ci
cp .env.example .env.production     # then edit it
npm run build                       # also copies assets for the standalone server
npm start                           # http://localhost:3000 — keep it running with pm2:
npx pm2 start npm --name ember -- start && npx pm2 save
```

Put Caddy or Nginx with HTTPS in front (see Option A, step 6). Without `DATABASE_URL`, data lives in `web/data/` — back it up.

---

## 3. After deploying — 5-minute check

1. `https://your-site/api/health` → `{"ok":true,"store":"postgres"}` (or `"file"`).
2. Open the site on your phone: place a small **pickup** order.
3. Open `https://your-site/admin`, log in, accept the order and mark it ready — the order page on your phone should update.
4. Book a table for tomorrow; check it appears under **Reservations**.
5. Share the link in WhatsApp — the preview card should show the food photo.
6. Switch a dish to sold-out in **Menu availability** and confirm the website shows it.

## 4. Backups

- **Postgres (Docker):** `docker compose exec db pg_dump -U ember ember > backup-$(date +%F).sql` (run daily with cron).
- **Neon/Supabase/Render:** enable their automatic backups.
- **File mode:** copy `data/db.json` somewhere safe regularly.

## 5. What's included vs. what to add later

Included and tested: server-side price checking, sold-out control, delivery-area check, slot capacity that holds under simultaneous bookings, order tracking with secret links, admin login with rate limiting (10 attempts / 15 min), spam limits on forms, security headers (CSP, HSTS, clickjacking protection), sitemap, robots.txt, social preview image, structured data for Google, error pages, health check, mobile-sized videos.

Not included yet (good next steps):
- **Online payments** — customers currently pay on delivery/at the counter. Add Razorpay/Stripe for prepaid orders.
- **Notifications** — SMS/WhatsApp/email to the customer and the kitchen. Today the kitchen must keep `/admin` open (it chimes for new orders).
- **Staff accounts** — one shared admin password; add per-person logins for larger teams.
- **Analytics** — e.g. Plausible or Google Analytics (update the CSP in `next.config.ts` to allow it).
- Rate limits are per server instance; behind multiple servers add Cloudflare in front.
