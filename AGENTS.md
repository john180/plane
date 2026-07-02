# Agent Development Guide

## Project Goal

This fork tracks upstream Plane while preserving a privacy-first, self-hostable build: no telemetry, no session recording, no default data reporting, and no required outbound calls for core product use.

- Keep telemetry disabled by default and at rest: `Instance.is_telemetry_enabled` defaults to `false`, legacy event/metrics Celery tasks stay no-op, and existing instances remain opted out through migrations.
- Do not reintroduce PostHog/event capture, session recorder scripts, default Sentry/OTLP collectors, product-update iframes, marketing/upsell flows, or hard-coded Plane cloud links that can disclose instance or user activity.
- Keep local deployment safe by default: `deployments/local-aio`, Dockerfiles, and env examples should route to local services or empty same-origin defaults unless an operator explicitly configures an integration.
- When syncing upstream, audit new env vars, dependencies, background jobs, frontend scripts, and external links for telemetry or privacy-reporting behavior, then remove or gate them behind explicit opt-in settings.
- Operator-configured integrations such as SMTP, S3-compatible storage, LLM providers, Unsplash, webhooks, or update checks must stay opt-in and make any outbound data flow obvious in configuration.

## Commands

- `pnpm dev` - Start all dev servers (web:3000, admin:3001)
- `pnpm build` - Build all packages and apps
- `pnpm check` - Run all checks (format, lint, types)
- `pnpm check:lint` - OxLint across all packages
- `pnpm check:types` - TypeScript type checking
- `pnpm fix` - Auto-fix format and lint issues
- `pnpm turbo run <command> --filter=<package>` - Target specific package/app
- `pnpm --filter=@plane/ui storybook` - Start Storybook on port 6006

## Code Style

- **Imports**: Use `workspace:*` for internal packages, `catalog:` for external deps
- **TypeScript**: Strict mode enabled, all files must be typed
- **Formatting**: oxfmt, run `pnpm fix:format`
- **Linting**: OxLint with shared `.oxlintrc.json` config
- **Naming**: camelCase for variables/functions, PascalCase for components/types
- **Error Handling**: Use try-catch with proper error types, log errors appropriately
- **State Management**: MobX stores in `packages/shared-state`, reactive patterns
- **Testing**: All features require unit tests, use existing test framework per package
- **Components**: Build in `@plane/ui` with Storybook for isolated development

## Backend tests (Docker)

The Django/pytest suite for `apps/api` runs in an isolated stack defined by `docker-compose-test.yml` at the repo root.

Prereq (once): `./setup.sh` — generates `apps/api/.env` from `.env.example`.

- Full suite: `docker compose -f docker-compose-test.yml up --build --abort-on-container-exit --exit-code-from api-tests`
- Subset: `docker compose -f docker-compose-test.yml run --rm api-tests pytest -m unit`
- Teardown: `docker compose -f docker-compose-test.yml down -v`

See `apps/api/tests/RUNNING_TESTS.md` for the full walkthrough and troubleshooting; see `apps/api/tests/TESTING_GUIDE.md` for test conventions and fixtures.
