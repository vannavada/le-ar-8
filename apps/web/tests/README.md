# Tests

## Running

```
npm test          # run all unit tests once (CI-safe)
npm run test:watch  # re-run on file change (dev loop)
```

Run from `apps/web/`. The root `npm test` delegates to `turbo run test` which calls this.

## Three-tier structure

### `unit/` — fast, always-on
Pure-function tests with no DB, no network, no browser.
These run on every save and in CI before every merge.
Currently covers:

- **`calculators/`** — all 7 FinanceHub calculator logic functions
  (`coast-fire`, `lifestyle-inflation`, `opportunity-cost`, `real-return`,
  `salary-negotiation`, `subscription-cost`, `time-to-fi`)
- **`affiliate.test.ts`** — `buildAffiliateUrl`, `hasAffiliateContent`,
  `parseKeyValueBlock` from `lib/affiliate.ts`

### `integration/` — pre-merge, needs infrastructure
Tests that hit a real database or network. Run before merge, not constantly.
See `integration/README.md`.

### `e2e/` — browser smoke tests, future work
Full browser flows via Playwright. See `e2e/README.md`.
