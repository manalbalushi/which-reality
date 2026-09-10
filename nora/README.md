# NORA — Gifts, Thoughtfully Curated.

A premium e-commerce prototype for **NORA**, an Omani gifting brand. Built with Next.js
(App Router), TypeScript and Tailwind CSS. Bilingual (English / Arabic with full RTL),
priced in OMR, and designed for a luxury GCC gifting experience.

## Highlights

- **Build Your Gift** — a 7-step gift builder (recipient → occasion → budget → style →
  packaging → products → personalization) with a live preview, dynamic pricing, and a
  rule-based "smart recommendation" engine (`src/lib/recommend.ts`) that curates a
  packaging + product combination from ~28 modular products and 6 packaging types.
- **Shop** with filterable/sortable catalog, product detail pages, related products,
  WhatsApp sharing and "Order via WhatsApp".
- **Occasions**, **Corporate gifting** (inquiry form), **Cart** and **Checkout** (delivery
  regions/methods, gift flag, payment method selection).
- **Admin dashboard** at `/admin` (demo password: `nora-admin`) — manage products,
  categories, occasions and packaging; view/update order status; see the exact recipient,
  occasion, budget, style, packaging, products and personalization a customer selected;
  view corporate requests.
- Cart state persists in `localStorage`; orders/corporate requests/admin-managed catalog
  data persist in a small JSON file store under `data/` (gitignored, created at runtime).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin dashboard: `/admin` (password
`nora-admin`, override with the `NORA_ADMIN_PASSWORD` env var).

## Project structure

- `src/data/` — seed catalog (products, categories, occasions, packaging, styles/recipients)
- `src/lib/` — types, i18n dictionary, cart/locale context, delivery pricing, recommendation
  engine, and the server-side JSON store (`src/lib/server/store.ts`)
- `src/app/` — pages (home, shop, build-your-gift, occasions, corporate, cart, checkout,
  admin) and API route handlers under `src/app/api/`
