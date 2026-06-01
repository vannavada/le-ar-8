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

**Single-author, not multi-author.** le-ar-8 is the owner's personal hub — one
voice, one byline, one thesis (see Brand name & meaning, Writing voice). It is
NOT a multi-contributor publication; friends/experts do not publish under their
own bylines or get author accounts. The single-author identity is core to the
brand ("a human writing for humans" — *a* human).

**Friends/experts can be SOURCES, not authors.** The owner may reach out to
knowledgeable people for their opinions/input on a topic, then *synthesize that
into the owner's own article, in the owner's voice* ("I asked people who know X;
here's what I learned, distilled for a reader like me"). This is sourcing /
primary-source reporting, not co-authorship — the article stays the owner's. It
keeps the site single-author and uni-directional, and it's a genuine quality
strength (original expert input is exactly what generic AI content lacks).
- **Sourcing norm:** get the source's consent, agree how to attribute them
  (named / "a friend who works in X" / anonymous), and represent their views
  accurately.
- **Implication for the authoring engine (Phase 4):** "synthesize gathered
  expert input into my voice" is a valid authoring INPUT mode, alongside
  "research a topic from scratch."

## What this is NOT

- ❌ Not a social platform. No user-generated content. No comments. No reactions.
- ❌ Not a multi-author publication. Single voice, owner's byline. (Friends can be
  sources the owner synthesizes from, never bylined authors — see above.)
- ❌ Not a finance app. It does not track anyone's money. (That's nestmargin.com.)
- ❌ Not paid/subscription on this site. Monetization is affiliate links only.
- ❌ Not a mobile app. Responsive web only.


## Brand name & meaning (canonical)

The name **le-ar-8** is intentionally layered. This is the single source of
truth for what it means and how to talk about it — for the About page, marketing,
and the AI authoring tool's sense of the site's identity.

**Primary meaning — the layered story (lead with this):**
- **le-ar-8 ≈ "layer 8."** In the OSI networking model there are 7 layers (the
  machine stack). "Layer 8" is industry slang for the layer above them all: the
  human layer — the person who thinks, decides, and writes. That's the thesis: a
  human writing for humans, above the machine.
- **"lear" = to learn / to teach (lore).** Genuine etymology: Middle English,
  and in Scottish/Northern English "to lear" means to teach or learn. For a
  knowledge/content hub, the name literally evokes learning. This is real, not
  invented — lean on it.
- **le + ar + 8.** "le" (French "the"), "ar" (augmented reality / augmentation),
  "8" = *Ashta*, the sacred eight in Hindu tradition (Ashta Lakshmi, Ashta
  Dikkulu — the eight directions/forms). The 8 also reads visually as infinity
  (and echoes the figure-8 logo).

**Positioning line worth using:** "Learn and create" (the "Lear-ate" reading) —
used as genuine substance (the site researches, forms a thesis, creates
content), not as a pun.

**Tone the name supports:** wisdom, authority, depth — earned through the quality
of the writing and the restraint of the design, NOT borrowed prestige. This
aligns with the editorial, Instrument-Serif, charcoal+teal direction.

**Do NOT use (off-brand or risky):**
- ❌ The **Learjet** association ("premium/elite/fast"). Borrowed prestige from
  an unrelated, trademarked aviation brand — off-strategy and a needless
  trademark proximity.
- ❌ **LEAR backronyms** ("Learn Engage Achieve Repeat", etc.). Generic
  content-marketing filler; reverse-engineered acronyms make the name feel less
  considered, not more. The layered story above is richer.
- ❌ Invented sound-alikes ("Luminate", "Elevate") — they describe brands le-ar-8
  is not.

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
   from client headers. No reader sign-up in the current model — accounts are for
   authors only (EDITOR/ADMIN). (Reader accounts are a documented future
   amendment in backlog.md, not built now.)
6. **Authorization — three roles: USER, EDITOR, ADMIN.** `publicProcedure` for
   reads. `editorProcedure` (role EDITOR or ADMIN) for content authoring —
   create/edit/publish articles in the hubs. `adminProcedure` (role ADMIN only)
   for governance — user/role management, site settings, infrastructure-level
   actions. Roles are carried in the JWT. Procedures defined in
   `apps/web/src/server/trpc.ts`. Rule of thumb: **editors author, admins
   govern.** (The editor *management* UI — invites, multi-author attribution,
   per-author edit rules — is deferred; see backlog. Only the role + procedures
   are built now.)
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
13. **User.role defaults to USER**, never EDITOR or ADMIN. Authors are promoted
    manually (USER → EDITOR or ADMIN) until an invite/management UI exists.
14. **Brand palette (locked hierarchy).** Charcoal `#1A1A1A` = foundation
    (text, dark surfaces, logo marks' primary). Neon Teal `#00D9CC` = THE single
    accent, used throughout (links, field focus, interactive states, the
    terminal `/8` submit affordance). Magenta `#D81B60` = a rare deliberate
    splash with ONE defined role: **affiliate / CTA color** (every affiliate
    link and the nestmargin CTA renders magenta). Discipline: teal is the
    everywhere-accent; magenta is sparing and reserved for CTAs only — never a
    second co-equal accent. This replaces the per-section accent colors as the
    *brand* palette; per-section colors still differentiate hubs but sit within
    this charcoal/teal foundation. Two logo marks share this palette. **Terminal
    `[/8]` (Concept 3) is the primary/chrome mark:** sitewide header (beside the
    "le-ar-8" wordmark, top left), a big FAINT `[/8]` watermark behind the
    homepage (must read as texture, not a third logo — very low opacity,
    theme-aware), the search-field submit affordance, and the technical/legal
    hubs (TechVault, FinanceHub, legal) when built. **Figure-8 (Concept 1, Human
    Element) is the expressive mark, reserved for the human-voice hubs**
    (ThoughtForge, MindStream, CommunitySpace) when built in Phase 2 — it is NOT
    on the homepage (competed with the headline). Both recolored to charcoal +
    teal so they read as one brand. See `brand/logo-concepts.md`.

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
repository, a tRPC router (public reads + `editorProcedure` mutations),
list/detail/new pages, Markdown body.

---

## Affiliate model

- One `AffiliateProgram` table: merchant, network, your affiliate ID, base URL,
  commission, categories. Credentials encrypted.
- Affiliate links render as **native content** — inline links or product cards
  using the site's own design system. Never banners, never popups, never a
  separate ad unit. "Seamless, not tacky" is the standard.
- FTC disclosure is required: one line, body-text styling, top of any page with
  affiliate links. Non-negotiable.
- `affiliate-mcp` (built with the affiliate system in Phase 3, used by the
  pull-authoring engine in Phase 4) scans drafts, extracts entities, matches the
  catalog, suggests placements. Owner approves during draft review.

---

## AI authoring system (two modes)

The same machinery powers two trigger modes. Shared parts: a research step, a
voice-generation step (Claude API + the owner's style guide), a `ContentDraft`
model, and a review queue. **Nothing auto-publishes — the owner reviews and
publishes every draft.**

**Mode 1 — Pull (on-demand authoring). Build this FIRST, right after Phase 2.**
The owner supplies a topic *and a thesis/angle* ("teenagers' overuse of 'like'
— my angle: the shift is away from eloquence toward sounding uncertain"). A
web-search/MCP research step gathers freely available material on that specific
topic; Claude writes the article *making the owner's argument*, evidence
attributed, in the owner's voice; the tool proposes a hub (owner can override);
it lands in the review queue. Critical: the tool amplifies the owner's thesis,
it does not invent insight. A bare topic with no thesis produces generic slop —
always feed it an opinion. Build the trigger first as an MCP server usable from
Claude Code/Desktop (owner already works there); an in-site admin authoring page
can come later. This pull tool is how the empty hubs get filled with real
content, so it precedes the scheduled mode.

**Mode 2 — Push (scheduled pipeline). Later, lower priority.**
`apps/pipeline` runs on a schedule (Vercel Cron). RSS/public sources → MCP
servers fetch + dedupe → Claude generates drafts across hubs → affiliate-mcp
suggests links → drafts land in the review queue. This is a "keep hubs fresh
automatically" convenience, built after the pull tool is working.

MCP servers: `news-mcp`, `finance-mcp`, `rates-mcp`, `publisher-mcp`,
`affiliate-mcp`, plus a research/web-search capability for the pull mode.
Sources must be public (news, RSS, public APIs, open web). Never insider or
paywalled data. Always attribute sources with an outbound link, synthesize in
the owner's voice — never copy.

---

## Writing voice (for generated content)

Short sentences, strong verbs, no passive voice. Opinion first, then support.
No "in today's fast-paced world" filler — ever. Confident recommendations
("Use Wise"), not hedging ("Wise might be worth considering"). Every piece ends
with something the reader can do today. Organized with headers, conversational
within them.

**Precision of connotation.** Choose words for the judgment and feeling they
carry underneath, not just surface meaning. Reject a perfectly good word when
its baggage contradicts the intent (e.g. "rabbit hole" implies getting lost and
wasting time; "cast adrift" implies chosen, pleasant discovery — the undertone
decides). The writing should make deliberate word choices and, where it sharpens
the point, name the distinction outright: "not X, but Y — and the difference
matters." Other examples of this instinct from the owner: "seamless, not tacky";
"elegant, not naive."

**Fine distinctions.** The owner thinks by separating things that look alike.
Good articles in this voice do the same — take two similar ideas, products, or
words and draw the precise line between them, because that line is usually where
the insight is.

**Instinct first, justification second.** The owner feels when something is
wrong before articulating why, then reasons back to it. Mirror that: state the
judgment with confidence, then unpack the reasoning. Don't bury the verdict in
qualifications.

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

Status as of this writing: **Phases 1 and 1.x are DONE and live** — foundation
(Prisma 7, consolidated server, three-role auth), the design system, the brand
identity + striking homepage, and the EDITOR role are all built, merged, and
deployed. **lear8.com is live.** Remaining phases below.

- **Phase 2 — NEXT (content hubs).** One shared `Article` model absorbing
  TechVault, covering TECH_VAULT / THOUGHT_FORGE / FINANCE_HUB / LEARN_HUB
  (hubs differ by editorial intent, not data shape). Repository, router,
  per-hub pages, Markdown editor + renderer, edit/delete UI, sharing buttons,
  per-hub theming, plus a standalone `/now` page. See `phase-2-spec.md` for the
  full plan. (MindStream → Phase 2.5, microblog, separate model. CommunitySpace
  dropped — "community" implies multi-user, which breaks uni-directional; logged
  in backlog as a future decision.)
- **Phase 3 — Affiliate system (PULLED EARLY — was Phase 4).** Build this soon
  after Phase 2, so content is monetizable the moment it exists. AffiliateProgram
  model, `NestMarginCTA`, `ProductCard`, FTC disclosure, admin management,
  magenta CTA styling. Rationale: affiliate is the *fastest realistic revenue
  path* (see Revenue strategy below) and rewards relevant content immediately —
  no point publishing monetizable content (TechVault gadgets, FinanceHub money
  tools) without the affiliate layer ready.
- **Phase 4 — Pull authoring engine (on-demand).** The AI authoring system's
  pull mode: MCP research + voice generation + draft queue, triggered by owner
  topic + thesis. **Build as an MCP server usable from Claude Code FIRST** to
  prove and tune the generation quality/voice cheaply, BEFORE wrapping it in a
  web cockpit (see Authoring cockpit north-star). This fills the hubs with
  quality, thesis-driven articles. Write the engine **host-agnostic** so it
  migrates to cloud hosting later without a rewrite.
- **Phase 5 — Calculators.** Cross-border net worth first (the nestmargin
  funnel), then US mortgage, India EMI, currency impact, retirement.
- **Phase 6 — Scheduled pipeline (push).** `apps/pipeline`, cron, RSS MCP
  servers. Lower-priority "keep hubs fresh" convenience.
- **Phase 7 — Interest rates.** `rates-mcp` + Vercel Cron, US/India rate pages.
- **Phase 8 — Polish.** PostHog analytics, SEO/sitemap/meta refinement, perf.

Work one phase at a time. Verify with `tsc` and a local run before committing.
Branch per phase. Commit to the branch freely; merge to main deliberately after
review. Push to `git@github.com:vannavada/le-ar-8.git` via SSH.

---

## Revenue strategy (how this site makes money)

**Quality + affiliate + targeting — NOT volume.** The goal is revenue sooner,
but the path is genuinely useful, thesis-driven articles aimed at the right
topics, NOT high-volume AI content.

- **Why not volume:** high-volume AI-generated content aimed at ad revenue is
  the exact pattern Google's "scaled content abuse" / "helpful content" updates
  penalize and deindex. Pumping dozens of mediocre articles/day risks a site
  that costs money to run and earns nothing because it can't get traffic. The
  site's differentiator is the owner's *thesis and voice* (see Writing voice) —
  generation amplifies that, it does not mass-produce generic filler.
- **Affiliate before ads.** Affiliate is the faster, lower-traffic-threshold
  revenue path and rewards *relevant* content (a great "best X for Y" review
  that meets buying intent earns more than 100 think-pieces). Display ad networks
  worth having (Mediavine/Raptive) need ~10k–50k+ sessions/month — that's a
  later, high-traffic play. So: affiliate now (Phase 3, pulled early), ads much
  later once traffic justifies it.
- **Targeting.** Point generation at commercial-intent topics where affiliate
  fits naturally — TechVault (gadgets/hardware) and FinanceHub (money tools:
  Wise, Remitly, the nestmargin funnel). Fewer, better, monetizable articles
  beat spray-and-pray volume.
- **Implication for the engine:** tune the pull-authoring engine for
  *quality and targeting*, not throughput. Same pipeline; high quality bar.

---

## Authoring cockpit (north-star for the authoring UX)

The end-state authoring experience: a single authenticated admin cockpit,
reachable remotely, where the owner goes idea → researched draft → review/refine
→ publish-to-hub-with-SEO-tags, in one place. ("Commit to a hub" = create a
published `Article` row with hub + tags + meta — a database write, NOT a git
commit; no deploy needed to publish.)

**Build order to reach it (de-risked):** prove the generation engine as an MCP
from Claude Code first (Phase 4) → once it writes well in the owner's voice,
build the web cockpit as a front-end over the proven engine. Do NOT build the
fancy cockpit around an unproven engine.

**Security requirement (non-negotiable for the cockpit):** a publicly-reachable
admin that can trigger web research and publish to a live site is a serious
surface. Before/with the cockpit: strong auth, a second factor (2FA), rate
limiting, and lockout. Governed by ENGINEERING-STANDARDS.md. Long-running
generation needs background jobs + status polling, not a blocking request.

---

## Enterprise-grade north-star (with trigger conditions)

The long-term vision is an enterprise-grade, cloud-hosted content platform:
self-hosted MCP servers (AWS or similar), agent orchestration, hosted generation
at scale. This is a real destination — but it is **gated by demand, not built
ahead of it.**

- **Build it lean until triggered.** Current lean stack (Vercel + Neon +
  MCP-from-Claude-Code) is the right call until there's content that works and
  an audience that's growing. Standing up AWS infrastructure before there's a
  single reader is building the factory before proving the product.
- **Trigger conditions to scale up** (any of): generation volume genuinely
  outgrows the simple approach; scheduled/remote-triggered generation becomes a
  routine need; audience traffic scales enough to justify the cost; the engine
  is proven and the bottleneck is now infrastructure, not quality.
- **Migrate, don't rewrite.** Write the engine host-agnostic now so MCP servers
  lift from Claude Code → hosted (AWS/Render/Fly) cleanly. DB: Neon → paid/RDS
  via the portable `@prisma/adapter-pg` design. Note "enterprise-grade" does NOT
  require AWS — Vercel + Neon + hosted MCPs is a legitimate production
  architecture; only move when there's a concrete reason.

---

## When in doubt

Ask before: changing the stack, adding a dependency that overlaps an existing
one, building anything in the NOT list, downgrading Prisma below 7, or adding
reader-facing accounts/social features. Default to the locked decisions above.
