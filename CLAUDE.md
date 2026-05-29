# CLAUDE.md — le-ar-8

Project knowledge for Claude Code. Read this first, every session. These are
settled decisions. Do not reopen them without the owner explicitly saying so.
If a request conflicts with a locked decision below, push back and cite it.

---

## What this is

le-ar-8 is a personal content hub deployed at **lear8.com**. The owner writes;
readers read. It is **uni-directional** — no reader accounts, no comments, no
reactions, no community/social features. Revenue comes from affiliate links
embedded seamlessly into content.

## What this is NOT

- ❌ Not a social platform. No user-generated content. No comments. No reactions.
- ❌ Not a finance app. It does not track anyone's money. (That's nestmargin.com.)
- ❌ Not paid/subscription on this site. Monetization is affiliate links only.
- ❌ Not a mobile app. Responsive web only.

## Relationship to nestmargin.com (critical)

**le-ar-8 markets nestmargin.com. It never contains it.**
- nestmargin.com is a separate product, separate repo, separate deployment,
  handled in its own Claude project. Do not import it, fold it in, or couple to it.
- The only connection is outbound: a `NestMarginCTA` component that links to
  nestmargin.com with UTM tracking. It is treated as the highest-priority
  affiliate. Zero code dependency between the two repos.

---

## Locked architecture

1. **Monorepo (Turborepo).** Two apps: `apps/web` (Next.js) and `apps/pipeline`
   (AI content pipeline, added in Phase 5). Shared `packages/database` (Prisma)
   and `packages/mcp-tools`.
2. **No standalone API server.** `apps/api` (Express) was deleted in Phase 1.
   All backend logic lives in `apps/web/src/server/`. One server, one auth path.
3. **tRPC** for all type-safe APIs, inside `apps/web`. Routers in
   `apps/web/src/server/routers/`, composed in `_app.ts`.
4. **Repository pattern.** Data access lives in `apps/web/src/repositories/`,
   separated from routers. Keep this pattern for every new section.
5. **Auth = NextAuth JWT.** Context is derived only from the signed JWT, never
   from client headers. Admin accounts only — no reader sign-up.
6. **Authorization.** `publicProcedure` for reads. `adminProcedure` (role ===
   "ADMIN", carried in the JWT) for every content mutation. Defined in
   `apps/web/src/server/trpc.ts`.
7. **Content format = Markdown.** Stored as Markdown text, rendered with
   `remark-gfm`. The AI pipeline outputs Markdown natively. No rich-text editor,
   no ProseMirror JSON. Admin writing UI is split-pane Markdown + live preview.
8. **Calculators are client-side only.** Pure React state. The single allowed
   server touch is fetching a live FX rate. No calculator state hits the DB.
9. **Analytics = PostHog** (free tier). One script tag. Track page views,
   affiliate-link clicks, nestmargin CTA clicks, calculator usage.
10. **Interest rates are automated** via Vercel Cron + a `rates-mcp` fetcher.
11. **Deployment: Vercel** (web) + **Vercel Cron** (jobs). **Database: Neon
    free tier for now.** Rationale: Render's free Postgres expires after 30 days
    and is limited to one free DB per account (nestmargin holds that slot), so
    Neon's permanently-free tier is the zero-cost choice for lear8 while it's
    built in public. The DB is plain Postgres behind Prisma 7's
    `@prisma/adapter-pg` adapter, so it's portable: **planned move to Render
    later** (once nestmargin is on paid Render) via `pg_dump`/`pg_restore` +
    swapping `DATABASE_URL`. Never hardcode `DATABASE_URL` — always env var, so
    the future move is a one-variable change. lear8 and nestmargin databases
    stay separate instances regardless of provider (isolation; playbook rule).
12. **Prisma 7** (Rust-free TypeScript client). Use the `prisma-client`
    provider (not `prisma-client-js`), ESM, with the `@prisma/adapter-pg`
    driver adapter. Generated client outputs to a path in source, not
    node_modules. Min Node 20.19+ / TypeScript 5.4+. Do not downgrade.
13. **User.role defaults to USER**, never ADMIN. Admins are promoted manually.

---

## The six sections

| Section | Route | Content type |
|---|---|---|
| TechVault | `/tech-vault` | Product reviews (tech, men's lifestyle, automotive, innovation) |
| ThoughtForge | `/thought-forge` | Professional / industry articles |
| MindStream | `/mindstream` | Personal thoughts — one-liners to expanded pieces |
| FinanceHub | `/finance-hub` | Finance articles + client-side calculators + rate tables. Funnels to nestmargin.com |
| LearnHub | `/learn-hub` | Placeholder for now |
| CommunitySpace | `/community` | Placeholder for now (name only — NOT a social feature build) |

Every content section follows the TechVault pattern: a Prisma model, a
repository, a tRPC router (public reads + admin mutations), list/detail/new
pages, Markdown body.

---

## Affiliate model

- One `AffiliateProgram` table: merchant, network, your affiliate ID, base URL,
  commission, categories. Credentials encrypted.
- Affiliate links render as **native content** — inline links or product cards
  using the site's own design system. Never banners, never popups, never a
  separate ad unit. "Seamless, not tacky" is the standard.
- FTC disclosure is required: one line, body-text styling, top of any page with
  affiliate links. Non-negotiable.
- `affiliate-mcp` (Phase 4/5) scans drafts, extracts entities, matches the
  catalog, suggests placements. Owner approves during draft review.

---

## AI content pipeline (Phase 5)

`apps/pipeline` runs on a schedule (Vercel Cron). Flow:
RSS/public sources → MCP servers fetch + dedupe → Claude API generates a draft
in the owner's voice → affiliate-mcp suggests links → saved to a `ContentDraft`
table (status PENDING) → **owner reviews and publishes**. Nothing auto-publishes.

MCP servers: `news-mcp`, `finance-mcp`, `rates-mcp`, `publisher-mcp`,
`affiliate-mcp`. Sources must be public (news, RSS, public APIs). Never insider
or paywalled data. Always attribute sources with an outbound link.

---

## Writing voice (for generated content)

Short sentences, strong verbs, no passive voice. Opinion first, then support.
No "in today's fast-paced world" filler — ever. Confident recommendations
("Use Wise"), not hedging ("Wise might be worth considering"). Every piece ends
with something the reader can do today. Organized with headers, conversational
within them.

---

## Conventions

- TypeScript everywhere, strict.
- `@/*` maps to `apps/web/src/*`.
- Import Prisma types from `@content-platform/database`, not `@prisma/client`.
- tRPC v11: the superjson transformer is set on the router init in
  `server/trpc.ts` — never passed to `fetchRequestHandler`.
- Tailwind for styling. Distinctive, intentional design — avoid generic AI
  aesthetics (no default purple-on-white gradients, no Inter-everywhere).
- Run `npx tsc --noEmit` before every commit. Zero errors required.

---

## Build phases

- **Phase 1 — foundation (apply to real repo first; not yet applied).**
  Delete `apps/api`, consolidate server into `apps/web`, add `adminProcedure`
  with role in the JWT, fix the tRPC transformer + imageUrl-null bugs. **Also
  upgrade to Prisma 7** in the same pass: `prisma-client` provider, ESM,
  `@prisma/adapter-pg`, generated output in source. The only file the Prisma 7
  import-path change touches is `packages/database/src/index.ts` — every
  repository/router imports from `@content-platform/database`, so they're
  insulated. Verify with `npx tsc --noEmit` before committing.
- **Phase 2 — NEXT.** ThoughtForge, MindStream, FinanceHub article models +
  repositories + routers + pages. Markdown editor + renderer. (Changes schema.)
- **Phase 3.** Calculators — cross-border net worth first (the nestmargin
  funnel), then US mortgage, India EMI, currency impact, retirement.
- **Phase 4.** Affiliate system — model, `NestMarginCTA`, `ProductCard`,
  disclosure, admin management.
- **Phase 5.** AI pipeline — `apps/pipeline`, MCP servers, Claude API, draft queue.
- **Phase 6.** Interest rates — `rates-mcp` + Vercel Cron, US/India rate pages.
- **Phase 7.** Polish + deploy — PostHog, SEO, sitemap, domain, go live.

Work one phase at a time. Verify with `tsc` and a local run before committing.
Branch per phase. Commit with clear messages. Push to
`git@github.com:vannavada/le-ar-8.git`.

---

## When in doubt

Ask before: changing the stack, adding a dependency that overlaps an existing
one, building anything in the NOT list, downgrading Prisma below 7, or adding
reader-facing accounts/social features. Default to the locked decisions above.
