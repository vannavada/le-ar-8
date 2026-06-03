# Integration tests

Tests in this folder require a live database and/or network access.
They are **not** run on every save — run them before opening a PR or merging
to main.

## Intended coverage (not written yet)

- **Repository queries** — `ArticleRepository`, `AffiliateRepository`:
  CRUD round-trips against a test Neon DB or a local Postgres instance.
- **FX rate fetch** — the live exchange-rate fetch used by the cross-border
  net-worth calculator: confirms the endpoint responds, parses correctly, and
  fails gracefully when unreachable.
- **Auth flows** — NextAuth credential callbacks against a seeded test DB.

## Setup required

1. Provision a separate test database (do NOT use the production Neon DB).
   Set `DATABASE_URL` to the test DB before running.
2. Run `npm run db:migrate` against the test DB.
3. Run integration tests: `vitest run tests/integration` (or extend
   `vitest.config.ts` with a separate integration config).

## When to run

- Locally before opening a PR that touches repository, server, or DB code.
- In CI on the merge-to-main step (not on every push to a feature branch).
