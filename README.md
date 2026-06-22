# TJ DERM — Interactive Prototype

A clickable design prototype for **TJ DERM**: a medical inventory system for Dr. T.J. Giuffrida's
Coral Gables dermatology practice, plus an insurance **prior-authorization** tracker.

> **Live demo:** https://student-enzo.github.io/tj-derm-demo/
> Works on phone and desktop. All data is **sample, de-identified** — no real patient information.

## What's inside

**Five core screens**
- `dashboard.html` — Doctor's glance dashboard (status by domain, one-tap reorder approvals, LN2 gauge)
- `stock.html` — Stock on hand (search, domain filters, table/card views)
- `receive-scan.html` — Receive by scanning a UDI barcode (lot + expiry auto-fill)
- `alerts.html` — Alerts & reorder (expiry digest, auto-drafted POs, approve-each vs auto-reorder)
- `prior-auth.html` — Insurance prior-authorization board (Phase 2)

**Alternative design concepts** (same job, different approach — for comparison)
- `dashboard-ops.html` — dense, action-first operations view
- `receive-grid.html` — keyboard-first fast-entry grid
- `receive-guided.html` — calm step-by-step wizard

**Live options in the UI**
- 3 visual themes (Clinical · Midnight · Warm) — switch from any screen, persists in the browser
- Doctor view ↔ Staff view (role-based)
- Workflow toggles (scan vs grid vs guided · approve-each vs auto-reorder)

## Design

Static HTML/CSS/JS — no build step, no backend. State persists via `localStorage`.
Design language adapted from the Atlantic Yacht Charter system (dark gradient sidebar, `rounded-xl`
cards with subtle ring, Inter + Playfair, mobile-safe rules), re-skinned for a clinical context
(teal + health-green, WCAG-AA contrast, SVG icons).

```
assets/css/tokens.css   design tokens + 3 themes
assets/css/app.css      components
assets/js/app.js        shared runtime (icons, state, shell)
assets/img/logo.svg     TJ DERM mark
```
