# le-ar-8 — Backlog

Deferred ideas and future work. Items here are intentionally NOT being built
now — they're parked so they don't derail the current phase, and so they're not
forgotten. When something is flagged with `[backlog]` in conversation, it lands
here.

Format: each item has a short title, why it's deferred, and any context needed
to pick it up later.

---

## Design / UX

### Homepage: evolve to "purer Google" form
- **What:** The homepage launches as search-field-first *with* scroll-revealed
  "latest from each hub" content (for SEO + credibility while hubs are filling
  up). Once there's a solid body of published content, evolve it toward the
  purer Google-style form — just the intent field, content one interaction away,
  more striking and minimal.
- **Why deferred:** Need content volume first. A pure search box over empty hubs
  has nothing to route to and nothing for SEO to crawl. Credibility/SEO wins now;
  striking minimalism wins once the site has substance.
- **Trigger to revisit:** When each hub has a meaningful number of published
  articles and search traffic is landing on article pages.

### AI-powered intent routing on the homepage
- **What:** Upgrade the homepage intent field from simple client-side routing
  (suggestion chips + keyword→hub matching) to real Claude-powered routing that
  interprets natural language and routes to *specific articles*, not just hubs.
  ("How do I track money across two countries" → the NRI finance article.)
- **Why deferred:** Only meaningful once hubs have content to route to. Uses the
  same Claude API the content pipeline already needs, so no new infrastructure —
  it's a natural add once content exists. Must keep a fast non-AI fallback so the
  homepage never hangs on an API call.
- **Trigger to revisit:** After Phase 2 sections are built and have articles.

---

## (add new [backlog] items below this line)

## Auth

### Set up Google OAuth (sign-in with Google)
- **What:** Wire up Google as a sign-in provider. Requires creating OAuth
  credentials in the Google Cloud console (client ID + secret) and registering
  authorized redirect URIs — **both** the dev URL (`http://localhost:3000/api/auth/callback/google`)
  and the production URL (`https://lear8.com/api/auth/callback/google`). Set
  `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` (dev) and in Vercel
  (production).
- **Why deferred:** Not configured, so the "Sign in with Google" button does
  nothing. Credentials (email/password) auth already works and is enough for a
  single-author site, so Google is a convenience, not a blocker. Setting it up
  now would also be a detour that has to be partly redone for the production
  domain anyway.
- **Trigger to revisit:** Optional. Do it when you want one-click sign-in, or
  fold the production redirect URL into the deploy step when lear8.com goes live.

### Editor management machinery
- **What:** The full multi-author experience on top of the EDITOR role (the role
  + `editorProcedure` itself are built now). Includes: an admin UI to invite /
  add / remove editors and change roles, an invite/onboarding flow, per-article
  author attribution (byline, "by X"), and edit-permission rules (can an editor
  edit another editor's drafts, or only their own?).
- **Why deferred:** The role foundation is cheap and worth adding now so it's not
  a migration later. But building management UI and multi-author workflows for
  editors who don't exist yet is premature. Build the foundation, defer the
  machinery until you actually hire someone.
- **Trigger to revisit:** When you're about to bring on a real editor. At that
  point also decide the edit-permission model (own drafts only vs. shared).

## Reader features

### Reader accounts + save/favorite articles
- **What:** Let readers (not just the admin) sign up, then save/favorite
  articles to reference later. Requires: a reader (non-admin) role distinct from
  ADMIN, a Favorite/SavedArticle data model (user ↔ article), a "my saved
  articles" view, per-user state, and auth UI for reader signup/login.
- **Why deferred:** This breaks the current uni-directional model (locked in
  CLAUDE.md: no reader accounts). It's a deliberate future expansion, not a
  drift. Premature now — there's no content to favorite yet, and storing reader
  accounts adds real privacy/data-protection obligations (policy, breach
  responsibility) not worth taking on before there's an audience that wants it.
  Sharing — the other half of the original request — is being built now and
  needs no accounts.
- **Trigger to revisit:** When the site has meaningful published content AND
  returning-reader traffic that would actually use saved articles. Treat as a
  proper architecture amendment then — design the reader-account model and
  privacy posture deliberately before building. Note: NextAuth already supports
  multiple roles and Phase 1's adminProcedure pattern means adding a reader role
  is additive, not a rewrite.

### Article sharing — BUILDING NOW (not deferred; logged for completeness)
- Share buttons on every article (copy link, X, LinkedIn, WhatsApp, email).
  No accounts, no DB, works for all readers. Part of the article/reading layout
  in the design + Phase 2 work.

## Branding

### Design final logo from a chosen concept
- **What:** Turn one of the two draft logo concepts (see `brand/logo-concepts.md`)
  into a finished, professional logo + full lockup set (horizontal, stacked,
  mark-only, favicon, light/dark variants). Concept 1 "Human Element"
  (figure-8 over OSI layers, magenta/cyan) or Concept 3 "Terminal Dot"
  (`[ /8 ]` monospace, teal). Brand name resolved: **le-ar-8 = "layer 8" = the
  human layer.**
- **Why deferred:** The current SVGs are usable working drafts (correct concept
  + spelling) but not final professional design. More importantly, there's an
  unresolved tension: the logo concepts are tech-vibrant while the site is
  built editorial/restrained (Instrument Serif, Linear/Paradigm). Pick the logo
  direction AND reconcile it with the site aesthetic together, deliberately.
- **Trigger to revisit:** Before public launch / when committing to a final
  brand identity. Decide logo concept + reconcile with site design as one step.

## Housekeeping / cleanup

### Delete the test TechVault review
- **What:** During CRUD verification today, a test review was created in
  TechVault (against the live Neon DB) to confirm the create→list→detail path
  works. It's real data in production Neon — delete it before launch so it
  doesn't show up as real content.
- **How:** There is no delete UI yet (deferred to Phase 2's authoring
  interface). For now, delete it directly — via Prisma Studio
  (`npm run db:studio`) or the Neon SQL editor. When the Phase 2 admin authoring
  UI is built, a proper delete button covers this going forward.
- **Trigger to revisit:** Now-ish (anytime before content is real), and the
  general delete-UI need is folded into Phase 2's authoring interface.

## Calculators

### Cross-border net worth calculator (DEFERRED)
- **What:** A calculator that aggregates assets/liabilities across multiple
  currencies into a single net-worth figure — explicitly the nestmargin funnel
  (cross-border NRI finance is nestmargin's domain). Listed among the FinanceHub
  calculators but deferred out of the first calculator build.
- **Why deferred:** It's the hardest calculator in the set — multi-currency,
  needs LIVE exchange-rate data (an FX API + caching + failure handling), and
  likely overlaps the planned rates-MCP / interest-rates infrastructure. Building
  it alongside the pure-math calculators would let its external-data complexity
  bleed into and slow down the simple ones. Build the self-contained calculators
  first (simple/compound interest, APY/APR, home loan IN + mortgage US, ROI,
  cost basis, cumulative returns — all pure client-side math, no external data),
  then tackle the FX-dependent ones (currency converter, cross-border net worth)
  as a focused second pass with a proper exchange-rate source.
- **Dependency:** a chosen, reliable exchange-rate data provider (research the
  current best free/reliable FX API at build time — rates/providers change).
  Pairs naturally with the currency-exchange calculator (same FX-rate need) and
  the rates-MCP phase.
- **Funnel note:** when built, this is a prime nestmargin cross-promo surface
  (NestMarginCTA placement).
- **Trigger to revisit:** After the pure-math calculator suite ships and the FX
  data source is settled (build it with the currency converter, which has the
  same FX dependency).
