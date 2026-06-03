# E2E tests (future work)

End-to-end browser tests using Playwright. Not set up yet.

## Intended coverage

Critical user flows that must work end-to-end in a real browser:

- **Calculator pages** — each of the 7 calculators renders, accepts input,
  and displays a result (no NaN/blank output on default values).
- **Editor flow** — an authenticated EDITOR can create, preview, and publish
  an article; the article appears on the hub page.
- **Affiliate disclosure** — any article body containing an affiliate link
  shows the FTC disclosure line above the content.
- **FinanceHub navigation** — the "Financial Calculators" card on `/finance-hub`
  is visible and links to `/finance-hub/tools`.

## Setup (when ready to implement)

```
npm install --save-dev @playwright/test
npx playwright install
```

Add a `playwright.config.ts` in `apps/web/` and a `test:e2e` script.
Point tests at a local dev server (`npm run dev`) or a preview deployment.

## When to run

- Before production deploys, against a preview URL.
- On a scheduled nightly CI job (not on every PR push — too slow).
