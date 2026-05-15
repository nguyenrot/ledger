# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important: Nuxt 4 (not Next.js)

This is the **only** Nuxt app in the X106 ecosystem — every other frontend is Next.js. Don't reach for Next.js conventions here (no `app/page.tsx`, no Server Actions, no `proxy.ts`). When in doubt, check `node_modules/nuxt/dist/` or the Nuxt 4 docs.

## Commands

```bash
npm run dev       # Dev server on port 3005
npm run build     # Production build (.output/)
npm run preview   # Preview the production build on port 3005
npm run typecheck # vue-tsc
```

No test suite is configured.

## Architecture

Personal expense/income tracker. **No initial balance / no running balance** — only individual income & expense transactions. Reports come from on-demand aggregation over the date range you pick.

**SPA mode (`ssr: false`)** — Nuxt builds a Nitro server that serves a single-page app. The token gate hydrates from `localStorage` on first paint, so SSR would just create a flash-of-no-auth. Keep it SPA unless you have a strong reason to flip back.

**Auth model is intentionally unlike the rest of X106.** No username/password. No JWT. One opaque token per account, stored in `localStorage` key `x106-ledger-token`. The server keeps only the SHA-256 hash. Losing the token = losing the account; there is no reset flow.

### File layout

```
app/
  app.vue                   # Root — gates render on token presence
  assets/css/main.css       # Tailwind v4 @theme + cyberpunk primitives
  pages/
    index.vue               # Today's view: form + totals + list
    reports.vue             # Date range + totals + charts + transaction list
  components/
    CyberBackground.vue     # Grid + scanline ambient
    TokenGate.vue           # First-time setup modal
    TopBar.vue              # Header nav + sign-out
    TransactionForm.vue     # New income/expense row
    TransactionList.vue     # Reusable list w/ inline delete
    TotalsCard.vue          # Thu / Chi / Net card
    ReportFilters.vue       # From-to date + group_by + presets
    ReportChart.vue         # SVG bar chart per bucket
    ReportCategoryBreakdown.vue  # SVG donut chart per category
  composables/
    useToken.ts             # localStorage-backed token
    useLedgerApi.ts         # Bearer-auth fetch wrapper
    useFormat.ts            # VND/date helpers + category catalog
```

Auto-imports are on (Nuxt default) — components from `app/components/` and composables from `app/composables/` don't need explicit imports inside `<script setup>`.

### Backend dependency

Talks to `x106-api` (Python/Django) via the `apps.ledger` app at `/api/v1/ledger/*`. All requests are `Authorization: Bearer <opaque-token>` — no cookies. Set `NUXT_PUBLIC_API_BASE` at build time to point at a different API origin (defaults to `https://api.kynguyen.cc`).

### Styling

Tailwind CSS v4 via `@tailwindcss/vite`. Theme tokens live in `app/assets/css/main.css` under `@theme {}`. Shared component classes (`.card`, `.btn-primary`, `.input-field`, `.label`, `.kind-income`, `.kind-expense`, etc.) are defined in the same file — prefer adding to that vocabulary over building one-off Tailwind chains in every component.

The visual language matches the rest of X106 — Chakra Petch for headings, Inter for body, Space Mono for labels and code. Cyan (`#00f5ff`) is the primary accent; rose for expenses, emerald for income, gold for warnings.

### Charts

Hand-rolled SVG — no chart library. The data sets are small (< 100 buckets, < 10 categories), so the math in `ReportChart.vue` and `ReportCategoryBreakdown.vue` is straightforward and avoids a dependency.

## Deploy

`git push` to `main` triggers `.github/workflows/deploy.yml`:

1. Ubuntu runner: `npm ci` + `npm run build`.
2. Tars `.output/` + `deploy.sh` → SCPs to `/tmp/ledger-deploy.tar.gz` on the VPS.
3. VPS: extracts into `/var/www/ledger`, recreates PM2 process `ledger-pkn` running `node .output/server/index.mjs` on port 3005, curls both `http://127.0.0.1:3005/` and `https://ledger.kynguyen.cc/`.

End-to-end ~90-180s. The workflow preserves `/var/www/ledger/.env*` across deploys.

Re-trigger / rollback to a branch or tag: `cd /Users/kynguyenpham/X106 && ./deploy.sh ledger [ref]`. SHA-direct rollback isn't supported by `gh workflow run` — tag the commit first.

`./deploy.sh` (this repo's local file at `/var/www/ledger/deploy.sh`) is a manual fallback — it expects the tar at `/tmp/ledger-deploy.tar.gz` and just extracts + recreates pm2.

Live at `ledger.kynguyen.cc`, port 3005, PM2 process `ledger-pkn`, VPS path `/var/www/ledger`. Watch deploys at `https://github.com/nguyenrot/ledger/actions`.
