# le-ar-8 — Phase 2 Spec: Content Hubs on a Shared Article Model

This is the detailed build plan for Phase 2. Hand it to Claude Code alongside
CLAUDE.md and ENGINEERING-STANDARDS.md. It follows the established TechVault
pattern (Prisma model → repository → tRPC router → pages) and all locked
decisions. Read CLAUDE.md first; nothing here overrides a locked decision.

---

## Goal

Stand up the article content hubs on ONE shared `Article` model, absorbing the
existing TechVault model into it. After Phase 2, the site has real, authorable,
shareable content across four hubs, plus a standalone `/now` page.

## Settled architecture decisions (the reasoning, so it isn't reopened)

- **One shared `Article` model** for all four article hubs. The hubs differ by
  editorial intent and subject, NOT by data shape — they're all articles (title,
  body, summary, author, published state). A single model means the authoring
  UI, edit/delete, sharing, the homepage cross-hub queries, and the future
  pull-authoring tool are built ONCE, not four times.
- **TechVault is absorbed** into the shared model. It's becoming a general tech
  hub (software, hardware, gadgets — reviews AND articles), so it wants the
  flexible article shape. Its review-specific fields (rating, product) become
  OPTIONAL fields on Article that only review-type pieces use.
- **The four hubs:** TECH_VAULT, THOUGHT_FORGE, FINANCE_HUB, LEARN_HUB. Each
  covers whatever subjects the owner wants; the hub is an editorial bucket, not
  a subject lock. (TechVault = software/hardware/gadgets; LearnHub =
  processes/learning/tutorials; ThoughtForge = editorials/business/finance/
  politics/economy/tech/social opinion; FinanceHub = finance content.)
- **A `tags` field** on Article handles cross-cutting topics (finance, tech,
  politics) so a ThoughtForge politics piece and a FinanceHub piece are findable
  by topic without forcing subject into the hub structure. Future-proofs
  cross-hub discovery and AI routing.
- **Per-hub theming** is presentation layered on the shared data — section
  colors + distinct hub feel, same Article table underneath.

## Explicitly OUT of Phase 2 (deferred — do not build)

- **MindStream → Phase 2.5.** Microblog is a genuinely different shape (short,
  title-optional, feed layout, compose box). Its own focused pass. The owner's
  build-log/changelog content will live here naturally when built.
- **CommunitySpace → dropped.** "Community" implies multi-user; the site is
  uni-directional (owner writes, readers read). A single-author "community" is a
  misnomer. Removed as a hub. "Multi-user community" is logged in backlog.md as
  a deliberate future architecture decision, NOT built.
- **Q&A is not a hub** — it's just an article whose title is a question, written
  in the relevant hub. The shared Article model already handles it. No new
  structure.
- **Reader accounts, comments, UGC** — still forbidden (uni-directional).

---

## Data model

### `Article` (shared, replaces TechVaultReview)

```prisma
enum Hub {
  TECH_VAULT
  THOUGHT_FORGE
  FINANCE_HUB
  LEARN_HUB
}

model Article {
  id          String    @id @default(cuid())
  hub         Hub
  title       String
  slug        String
  summary     String?
  body        String    // Markdown
  tags        String[]  @default([])   // cross-cutting topics
  published   Boolean   @default(false)
  publishedAt DateTime?
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Optional review fields — used by TechVault review-type pieces; null otherwise
  rating          Int?     // 1–5, only for reviews
  productName     String?
  productCategory String?

  @@unique([hub, slug])   // slug unique WITHIN a hub (routes are /[hub]/[slug])
  @@index([hub, published, publishedAt])
}
```

Notes:
- `@@unique([hub, slug])` not global unique — each hub has its own slug
  namespace, matching the flat `/tech-vault/[slug]` routes.
- Review fields are optional and nullable. A normal article leaves them null; a
  TechVault review fills them. (Replaces the old TechVaultCategory enum with a
  simple optional `productCategory` string; tags cover categorization more
  flexibly now.)
- The old `TechVaultReview` model is REMOVED. **The table is currently empty
  (the test review was deleted), so this is a STRUCTURAL migration only — no
  data migration needed.** This makes the absorb safe and clean.

### `NowPage` (for the `/now` page — single editable page)

```prisma
model NowPage {
  id        String   @id @default(cuid())
  body      String   // Markdown
  updatedAt DateTime @updatedAt
}
```

A singleton (one row). The `/now` page renders its body; an admin edit screen
overwrites it. Not a hub, not a collection — one living page.

---

## Build order

Work on a branch `phase-2-content-hubs`. Commit after each major step (per the
workflow: commit to branch freely, do NOT merge to main until reviewed). Run
`npx tsc --noEmit` before each commit.

### Step 1 — Schema migration (the delicate one: touches live, empty DB)

1. Add the `Hub` enum and `Article` model; add `NowPage`.
2. Remove the `TechVaultReview` model and `TechVaultCategory` enum.
3. Generate the migration. Because TechVaultReview is empty, this is structural
   only — confirm the migration drops the old table and creates the new ones
   with no data-loss risk (there's no data).
4. Apply to Neon (the production DB). Verify with Prisma Studio that `Article`
   and `NowPage` tables exist and `TechVaultReview` is gone.
5. **This is the riskiest step** because it touches the live schema and the
   existing TechVault code will break until Steps 2–5 repoint it. Do the schema
   + repository + router + pages migration as one coherent push so the app
   isn't left half-broken.

### Step 2 — Repository

- Create `apps/web/src/repositories/article.ts` — `createArticleRepository(db)`
  with: `list({ hub, published, tag?, limit, offset })`, `getBySlug(hub, slug)`,
  `getById(id)`, `create(data)`, `update(id, authorId, data)`,
  `delete(id, authorId)`, and a `randomPublished()` for the homepage "cast me
  adrift" (returns one random published article across all hubs).
- Delete the old `tech-vault.ts` repository (absorbed).

### Step 3 — tRPC router

- Create `apps/web/src/server/routers/article.ts`:
  - `list` (publicProcedure) — hub-filtered, published-only for public; accepts
    optional `tag` filter.
  - `getBySlug` (publicProcedure) — unpublished visible only to EDITOR/ADMIN author.
  - `randomPublished` (publicProcedure) — for "cast me adrift".
  - `create` / `update` / `delete` (**editorProcedure** — EDITOR or ADMIN).
- Register in `_app.ts` as `article`. Remove the old `techVault` router.
- Mirror the input validation style from the old tech-vault router (Zod, slug
  regex, rating 1–5 when present, etc.).

### Step 4 — Hub pages (shared components, explicit per-hub routes)

Routes stay flat per CLAUDE.md (no route groups, no catch-all `[hub]`). Each hub
has its own route folder rendering SHARED components parameterized by hub:

- `app/tech-vault/page.tsx` → `<HubList hub="TECH_VAULT" />`
- `app/thought-forge/page.tsx` → `<HubList hub="THOUGHT_FORGE" />`
- `app/finance-hub/page.tsx` → `<HubList hub="FINANCE_HUB" />`
- `app/learn-hub/page.tsx` → `<HubList hub="LEARN_HUB" />`
- `app/[hub]/[slug]/page.tsx` pattern per hub → `<ArticleDetail hub slug />`

Build `HubList`, `ArticleDetail`, `ArticleCard` as shared components driven by
the `hub` prop, so the four hubs reuse one implementation. Use the existing
`SECTIONS` metadata + per-section colors for theming (Step 8).

### Step 5 — Markdown renderer

- Shared `ArticleBody` component rendering Markdown with `remark-gfm`, styled
  with the `@tailwindcss/typography` `prose` classes already installed
  (`prose dark:prose-invert`). This renders the article body on detail pages.

### Step 6 — Authoring: new + edit + delete (per hub, shared components)

- Per CLAUDE.md, the admin writing UI is a split-pane Markdown editor + live
  preview. Build a shared `ArticleEditor` component (textarea Markdown left,
  live `ArticleBody` preview right) used by both new and edit.
- `app/<hub>/new/page.tsx` per hub → `<ArticleEditor hub />` (create).
- An edit route per article → `<ArticleEditor hub article />` (edit existing).
- **Delete UI** — a delete button on the article detail page or edit screen
  (editorProcedure-gated). This ends the Prisma-Studio-surgery era.
- All authoring gated to EDITOR/ADMIN; readers never see authoring UI.
- Review fields (rating/product) shown in the editor only when the hub is
  TECH_VAULT (or via a "this is a review" toggle), so other hubs don't show
  irrelevant fields.

### Step 7 — Sharing buttons

- Shared `ShareButtons` component on each article **detail** page (not list):
  copy link, X, LinkedIn, WhatsApp, email. No accounts, no tracking beyond
  PostHog. Pure client-side share links / `navigator.clipboard`.

### Step 8 — Per-hub theming

- Apply each hub's accent (from `SECTIONS`) to its list/detail pages — section
  header, accent on links/CTAs within the hub, distinct feel — while staying
  within the charcoal + teal brand foundation (CLAUDE.md #14). Per-hub
  personality via presentation; shared Article data underneath.
- The Concept-3 terminal `[/8]` mark goes in the TECH_VAULT (and any
  technical/legal) hub headers per CLAUDE.md #14; the figure-8 stays on the
  homepage (and is reserved for the human-voice hubs when MindStream/2.5 lands).
- Magenta only for affiliate/CTA (none here yet — so no magenta on these pages).

### Step 9 — The `/now` page

- `app/now/page.tsx` — renders the single `NowPage` body as Markdown
  (`ArticleBody`). Public, no auth to read.
- An edit screen (editorProcedure) to overwrite it — reuse `ArticleEditor`’s
  Markdown+preview, writing to the `NowPage` singleton.
- Link it somewhere quiet — footer and/or header nav.
- Tiny `nowPage` tRPC router (get + update) or fold into a small route.

### Step 10 — Homepage reconnect

- The homepage "cast me adrift" and keyword routing now have real content to
  point at. Update the random-article query to use
  `articleRepository.randomPublished()` across the shared Article model (one
  query now, instead of per-hub). Keyword routing already maps words → hub; no
  change needed beyond confirming it still works against the new routes.
- The homepage stays `force-dynamic` (per the deploy fix).

---

## Verification (before merging to main)

- `npx tsc --noEmit` zero errors.
- Migration applied to Neon; `Article` + `NowPage` exist, `TechVaultReview` gone.
- For EACH of the four hubs: list page loads, create an article (as ADMIN),
  it appears in the list, detail page renders the Markdown body, edit works,
  delete works. All four hubs.
- A TechVault review-type piece (with rating + product) creates and renders
  correctly; a normal article (no review fields) also works in TechVault.
- Sharing buttons present on detail pages and functional.
- Per-hub theming visible and distinct; dark mode holds everywhere.
- `/now` page renders and is editable by admin.
- Homepage "cast me adrift" routes to a random real article; keyword routing
  still works; all hub routes 200.
- Unauthenticated users cannot create/edit/delete (editorProcedure enforced);
  readers see no authoring UI.
- view-source: hub list and article pages are server-rendered (SEO).
- Test in light AND dark mode.

## After Phase 2

- **Phase 2.5:** MindStream (separate model, microblog feed + compose, build-log
  content lives here).
- **Phase 3 — Affiliate system (PULLED EARLY):** AffiliateProgram model,
  NestMarginCTA, ProductCard, FTC disclosure, magenta CTA styling — so content
  is monetizable as soon as it exists. Affiliate is the fastest realistic
  revenue path; build it right after the hubs.
- **Phase 4 — Pull authoring engine:** the MCP research + voice-generation tool,
  built as an MCP from Claude Code first to prove quality/voice, written
  host-agnostic for later cloud hosting. Tuned for QUALITY + targeting, not
  volume (see CLAUDE.md Revenue strategy). This is now simple — one Article
  model to write to.
- **Phase 5+:** calculators, scheduled pipeline, interest rates, polish.
- **North-stars (CLAUDE.md):** the remote authoring cockpit (built over the
  proven engine, with hardened auth) and the enterprise cloud-MCP platform
  (built when demand triggers it). See CLAUDE.md.

## Parallel, non-blocking

- **Hub naming/branding** — building with current names (TechVault, ThoughtForge,
  FinanceHub, LearnHub). Finalizing brand-level names is a `SECTIONS` constant +
  `hub` enum change, doable anytime; does NOT block the build.
