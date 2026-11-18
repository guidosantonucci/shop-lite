# Shop Lite 🛒

A small storefront (product grid, cart, discount codes, checkout) with an end-to-end test suite written in **Playwright + TypeScript**.

![CI](https://github.com/guidosantonucci/shop-lite/actions/workflows/e2e.yml/badge.svg)

## What the suite demonstrates

| Skill | Where |
|---|---|
| Page Object Model | `tests/pages/` – `ShopPage`, `CartPage`, `CheckoutPage` |
| Custom fixtures | `tests/fixtures.ts` – page objects are injected into every test |
| Data-driven tests | `tests/pricing.spec.ts` (discount codes), `tests/checkout.spec.ts` (form validation) |
| Business-rule checks | shipping threshold, % vs fixed discounts, quantity cap, totals never negative |
| State persistence | cart survives reload (localStorage) |
| Cross-device | every test runs on Desktop Chrome **and** Pixel 7 |
| Tagging | `@smoke` subset for quick checks |
| CI | GitHub Actions matrix (desktop / mobile), HTML report uploaded as an artifact |

## Business rules under test

- Shipping is **$5**, free when the order is **$50+** after discounts.
- Codes: `SUN10` (10% off), `SAVE5` ($5 off, never below $0), `FREESHIP`. Codes are case-insensitive.
- Max **10** units per product.
- Checkout requires a name, a valid email and a 5-digit ZIP.

## Run it

```bash
npm ci
npx playwright install chromium
npm test              # full suite, both devices (the app starts automatically)
npm run test:smoke    # @smoke only
npm run report        # open the HTML report
npm start             # just run the app at http://localhost:4173
```
