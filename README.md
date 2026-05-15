# Ledger — kynguyen.cc

Personal expense/income tracker. One opaque token per account; no usernames, no passwords. Built with Nuxt 4 + Tailwind v4. Talks to the shared X106 API for storage.

## Quick start

```bash
npm install
npm run dev       # http://localhost:3005 (defaults to prod API)
```

Point the dev server at a local API instead:

```bash
NUXT_PUBLIC_API_BASE=http://localhost:4000 npm run dev
```

## Architecture & deploy

See `CLAUDE.md` for the full layout, auth model, and deploy flow.
