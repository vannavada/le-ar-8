# ENGINEERING-STANDARDS.md — shared baseline

Universal practices every project inherits. Drop this file, unchanged, into
every repo (lear8, nestmargin, and every future project). Each project's
`CLAUDE.md` opens with a line pointing here and then holds **only** what is
unique to that project.

**Principles live here; parameters live in the project file.** Where this file
says "the project sets the value" (a timeout duration, the exact typecheck
command, the push target), do not bake a number into this file — the project's
`CLAUDE.md` fills it in. Keep this file generic: no project names, no stack
names that aren't truly universal.

When this file changes, re-copy it into each repo (it must physically exist in
each repo — Claude Code only reads the repo it's running in).

---

## Security

- **No secrets in code.** Keys, tokens, connection strings, credentials live in
  env vars only — server-side only, never in a client/browser bundle, never
  committed. (This also keeps a provider move to a one-variable change.)
- **Validate and sanitize all external input.** Parameterized queries only —
  never build SQL by string concatenation.
- **HTTPS everywhere.**
- **Dependencies kept patched.** Don't knowingly add a package with a known
  vulnerability.
- **Never log secrets, tokens, passwords, or PII.**
- **Document where each encryption key lives.**

## Auth & sessions

- Passwords hashed with a modern algorithm (bcrypt/argon2) — never plaintext,
  never reversible.
- Sessions via `httpOnly`, `secure` cookies. Derive identity server-side from
  the signed token, **never** from client-supplied headers.
- **Least privilege.** Each role gets the minimum it needs.
- Any app with accounts expires sessions. Apps handling sensitive or financial
  data **must** have an inactivity timeout — *the project sets the duration.*

## Security-review discipline

When a change touches **authentication, credential/token storage, or per-user
data isolation**, explain — unprompted, in plain reviewable language:

- how passwords are hashed and how sessions are handled (`httpOnly`/`secure`);
- how third-party API tokens / OAuth credentials are encrypted at rest (never
  plaintext) and **where the encryption key lives**;
- how every data query is scoped to the authenticated user so nothing leaks
  across users;
- where secrets live (server-side only; never in the client bundle).

For any app handling **sensitive or financial data**, a second independent
human security review is required **before go-live**. Do not treat
auth/security as "done" without it.

## Data

- Don't delete production data without explicit confirmation.
- Migrations and backups before destructive schema changes; always keep a
  restore path.
- **Schema migrations and the code that depends on them deploy together.**
  Never apply a migration to the production database before deploying the
  matching application code. The still-running old code will query a schema
  that no longer matches and break immediately (dropped tables, renamed
  columns, missing enums). The safe pattern: migration and code land in the
  same merge-to-main / deploy, so live schema and deployed code always agree.
- Collect the minimum data needed — nothing more.

## Conditional — financial / PII data

If a project stores money data, links bank/financial accounts, or holds PII,
the following are mandatory (not optional):

- Treat every third-party financial token as a secret: encrypted at rest, key
  server-side only.
- Strict per-user isolation on **every** query — the default failure mode of a
  finance app is cross-user leakage, so this is checked, not assumed.
- Inactivity timeout (project sets the duration).
- The independent human security review above is required before go-live.

## Code & version control

- Typecheck and lint pass with **zero errors before every commit**. *The
  project names the exact command.*
- Work on branches; merge deliberately; **never force-push a shared branch.**
- Clear, specific commit messages.
- Typed projects: strict type-checking required — never loosen strict mode to silence an error.

## Web UI basics (if the project has a web UI)

- Semantic HTML, keyboard navigable, alt text, sufficient color contrast.
- Responsive.
- Explicit loading and error states — never a silent failure.
- Distinctive, intentional design; avoid generic AI aesthetics (no default
  purple-on-white gradients, no Inter-everywhere).

## Privacy & compliance (if collecting user data)

- A privacy policy when collecting user data.
- Cookie / consent banner where the jurisdiction requires it.
- Clear disclosure of any material relationship (affiliate, sponsored) where
  law requires.

## How we work

- Start each session by stating **which phase/step we're in and what changed**
  since last time.
- One phase at a time; verify (typecheck + a local run) before committing;
  branch per phase.
- Off-path ideas get **parked** (`parked.md` / `backlog.md`), not pursued
  mid-phase.
- Locked decisions in the project `CLAUDE.md` are settled. **Push back and cite
  them** if asked to violate one. Ask before changing the stack or adding a
  dependency that overlaps an existing one.
- **Finish beats perfect.**
