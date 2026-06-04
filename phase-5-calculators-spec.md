# le-ar-8 — Phase 5 Spec: FinanceHub Calculator Suite

Build plan for the FinanceHub calculator tools. Hand to Claude Code alongside
CLAUDE.md and ENGINEERING-STANDARDS.md. Read CLAUDE.md first — especially
locked decision #8 (calculators are client-side only; the single allowed server
touch is fetching a live FX rate; no calculator state hits the DB).

## Locked scope decisions

- **Location:** a `/finance-hub/tools` subsection (distinct from FinanceHub
  articles). Standalone interactive tool pages.
- **Shared framework:** ONE calculator framework/shell (consistent layout,
  inputs, results, FinanceHub theming, mobile-responsive). Each calculator plugs
  into it — do NOT build N bespoke pages.
- **Public, no auth, client-side math.** No DB writes (per CLAUDE.md #8). Pages
  are server-rendered for SEO but calculation is client-side React state.
- **Home loan = ONE calculator with an IN/US toggle** (currency + country
  defaults; light-to-medium depth, not every nuance — note deeper country rules
  as a later refinement).
- **No magenta except affiliate/CTA.** Calculators may carry contextual
  affiliate placements (e.g. a "compare lenders" ProductCard) and NestMarginCTA
  where natural — especially the cross-border ones (nestmargin funnel).
- **PostHog event:** calculator usage (per CLAUDE.md #8) — fire a usage event
  when a calculation runs (when PostHog is wired in Phase 8; stub/no-op until).

## Build order (three builds, by dependency)

Build 1 = pure math (no deps, ship first). Build 2 = needs live FX data.
Build 3 = encodes tax/legal rules (accuracy-critical, heavy disclaimers).
Work each on its own branch. Commit to branch, merge deliberately after review.

---

## BUILD 1 — Framework + 7 pure-math calculators

No external data. Pure client-side math. Buildable/testable WITHOUT a database
connection (so it works on any network — no tether needed). Ship this first.

### The shared framework (build FIRST, before the calculators)

Create a reusable calculator shell, e.g. `components/calculators/`:
- `CalculatorShell` — consistent page layout: title, short intro/description,
  an inputs area, a results area, optional notes/assumptions, optional
  affiliate/CTA slot. FinanceHub theming (the hub accent). Mobile-responsive.
- Reusable input primitives: labeled number input (with currency/percent/years
  adornments), currency selector where needed, sliders optional, a "reset"
  affordance. Sensible formatting (thousands separators, currency symbols, %).
- A results display pattern (big headline number + supporting breakdown rows,
  optionally a small chart for time-series ones via recharts if already available).
- Each calculator = a config + a pure calc function + the shell. The calc
  functions live in `lib/calculators/` as pure, unit-testable functions
  (input object → result object), separate from the React UI.
- `/finance-hub/tools` index page listing the available calculators (cards).

### The 7 calculators (each = a pure function + a shell instance)

1. **Lifestyle inflation** — given current income, a raise amount, and a
   lifestyle-creep % (how much of the raise gets absorbed by higher spending),
   show what the raise *actually* nets to savings vs. what it could if invested.
   Compare "creep" vs "bank the raise" over N years.
2. **True cost of a subscription** — given a recurring cost (monthly/annual) and
   an assumed investment return, show the compounded opportunity cost over N
   years ("this $15/mo subscription = $X in 20 years if invested instead").
3. **Opportunity cost of a purchase** — one-time $X today vs. its future value
   if invested at rate r for N years.
4. **Coast-FIRE** — given current invested assets, expected return, retirement
   age, and target retirement number, compute whether/when the user has "coasted"
   (can stop contributing and still hit the target). Show the coast number and
   age.
5. **Salary negotiation value** — given a raise amount, career years remaining,
   and a raise-compounding assumption, show the lifetime value of a one-time
   raise (compounded raises + the invested difference).
6. **Time to financial independence** — given income, savings rate, expected
   return, and a withdrawal-rate target (e.g. 4%), compute years to FI. Framed
   around savings RATE (the real FIRE math), not just a target number.
7. **Real return** — given a nominal return, an inflation rate, AND a
   user-entered tax rate, compute the real (after-inflation, after-tax) return.
   IMPORTANT: the tax rate is USER-ENTERED — the calculator does NOT compute the
   user's tax. Keep it pure math; label inputs clearly.

### Build 1 verification
- `npx tsc --noEmit` zero errors.
- `/finance-hub/tools` lists all 7; each loads, computes correctly, updates live
  as inputs change.
- Spot-check the math on each (e.g. compound/future-value formulas correct).
- The calc functions are pure (input→output), ideally with a few unit tests.
- Mobile + light/dark; FinanceHub theming applied; SEO-renderable (server-rendered
  shell, client interactivity).
- No DB calls (confirm — these must work with no database connection).
- Commit to branch `phase-5a-calculators`. Do not merge to main until reviewed.

---

## BUILD 2 — 3 cross-border calculators (need LIVE FX data)

These need current exchange rates (INR + major currencies) and, for two of them,
some reference data (FD/savings rates, cost-of-living). They are ESTIMATORS about
returns/value — label them "estimate" but they are not legally risky like Build 3.
This is the nestmargin moat — prime NestMarginCTA placement.

### FX data integration (the new dependency — do this first in Build 2)

Per CLAUDE.md #8, fetching a live FX rate is the ONE allowed server touch.
- **Research the current best FX-rate API at build time** (don't assume a
  specific provider from stale knowledge — web-search for current free/reliable
  options that cover INR + major currencies, e.g. exchangerate-style APIs, with
  reasonable free-tier limits). Pick one; document the choice.
- Fetch rates **server-side** (a route handler / server action), NOT client-side
  with a key exposed. The API key goes in env vars (NEVER hardcoded, never in
  client bundle) — entered by the owner in .env and Vercel, per ENGINEERING-STANDARDS.
- **Cache** rates (FX doesn't need per-keystroke freshness — cache for hours,
  e.g. revalidate periodically). Do NOT call the API on every input change.
- **Handle failure gracefully**: if the API is down/rate-limited, show a clear
  "rates unavailable, try later" state and/or fall back to a last-cached rate
  with a timestamp ("rates as of …"). Never silently show wrong/zero rates.
- Show a "rates as of [timestamp]" label so users know freshness.

### The 3 calculators

1. **US↔India "where should my money live"** — given an amount, compare growth
   in India (FD/savings rate) vs. US (savings/investment return), factoring live
   FX + an FX-trend assumption (user-adjustable) + user-entered tax assumptions
   in each country. Output: which grows more, by how much, with the assumptions
   shown. (FD/US rates: user-editable defaults, optionally seeded from a rate
   source if one is wired later; do not hardcode as authoritative.)
2. **Cross-border rent-vs-buy** — buy property in India (while living in US):
   rental yield, FX, repatriation friction vs. investing the same money in the
   US. User-entered property price, rent, appreciation, US return; live FX.
3. **Cost of moving back to India** — salary equivalence + cost-of-living swing:
   what US savings/salary are "worth" in India. Needs live FX + a cost-of-living
   ratio (user-entered or from a COL reference; if no clean COL API, user-enters
   a COL index or city pair with sensible defaults — research whether a COL data
   source is worth integrating, else user-input).

### Build 2 verification
- FX fetched server-side, key in env (not client), cached, failure-handled,
  "rates as of" shown.
- Each calculator computes correctly with live rates; FX failure shows a clean
  state, not garbage.
- Estimator disclaimer present ("estimate; assumptions shown; not financial
  advice").
- NestMarginCTA placed naturally (these are the funnel calculators).
- tsc clean; mobile + light/dark; commit to branch `phase-5b-crossborder`.
- NOTE: server-side FX fetch means LOCAL testing needs network to the FX API
  (not the DB) — but if the dev server also queries Neon for the page shell,
  local dev still needs DB reachability (tether if on the firewalled network).

---

## BUILD 3 — 3 regulatory calculators (encode TAX/LEGAL rules — accuracy-critical)

These encode rules that (a) change over time and (b) mislead users about what is
legal/taxable if wrong. They MUST be built with explicit verify-before-trust rule
data and prominent disclaimers. "Implemented" ≠ "correct" here — treat accuracy
as the priority.

### Hard requirements for ALL Build 3 calculators
- **Rule constants in a clearly-marked, single config** (e.g.
  `lib/calculators/regulatory-rules.ts`) with: the value, an inline comment with
  the SOURCE and the "as of" year, and a clear "VERIFY/UPDATE THESE — may be
  outdated" header. Do not scatter magic tax numbers through the code.
- **Prominent disclaimer on every Build 3 calculator**: "Estimate only. Tax and
  regulatory rules change and vary by individual circumstances. This is NOT tax
  or legal advice — consult a qualified cross-border tax professional." Top of
  page, not buried.
- **Show the rules/assumptions used** ("based on [rule] as of [year]") so the
  estimate is transparent, not a black box.
- Do NOT present false precision (round, show ranges where appropriate).

### The 3 calculators
1. **NRI repatriation calculator** — estimate how much of Indian income/assets
   can be repatriated to the US (e.g. the USD 1M/year scheme), with tax
   implications. Rule constants flagged + dated. Heavy disclaimer.
2. **Gift/remittance limit calculator** — US→India transfer limits, US gift-tax
   annual exclusion / lifetime thresholds, optimal structuring. These are
   specific tax thresholds that change — flag, date, disclaim.
3. **Dual-tax-residency estimator** — rough exposure with income in both
   countries. THE most complex/highest-liability one. Build it as a deliberately
   ROUGH, heavily-caveated estimator (or a guided explainer) — explicitly NOT a
   precise tax computation. Strongest "consult a professional" framing of the set.

### Build 3 verification
- All rule constants in the marked config with source + as-of-year + verify
  warning.
- Disclaimer prominent on each; assumptions shown; no false precision.
- Math correct given the (flagged) rule inputs.
- Owner must VERIFY the rule values against current sources before relying on
  these — note this explicitly in the UI and to the owner.
- tsc clean; mobile + light/dark; commit to branch `phase-5c-regulatory`.

---

## Cross-cutting

- These tool pages are strong **affiliate + nestmargin-funnel surfaces** — the
  cross-border ones especially. Place NestMarginCTA and relevant affiliate
  ProductCards naturally (per Phase 3a components), magenta CTA only.
- Calculators are **shareable, low-competition content** — the differentiated
  ones (cross-border, the "rarely-built" pure-math) are the SEO/linkability play
  vs. commodity calculators.
- All pages SEO-renderable (server shell + client interactivity).
- Build order is by dependency, not preference: 5a ships immediately (no deps),
  5b after FX source chosen, 5c with careful rule-data + disclaimers.
