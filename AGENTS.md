# AGENTS

Agent instructions for this repository. Keep changes deterministic, small, and aligned with the game rules.

## Project Focus
- Table Baseball-Little implementation in vanilla TypeScript + Vite.
- Core gameplay logic is deterministic and seed-driven.
- Rules source of truth: [docs/rules.md](docs/rules.md).

## Setup And Commands
- Install: npm install
- Dev server: npm run dev
- Build: npm run build
- Preview build: npm run preview
- Lint: npm run lint
- Unit/integration tests: npm test
- Watch tests: npm run test:watch
- E2E tests: npm run test:e2e

## Architecture Boundaries
- Domain layer: [src/domain](src/domain) (pure types/data and rule tables).
- Engine layer: [src/engine](src/engine) (state machine, runners, events, RNG).
- AI layer: [src/ai](src/ai) (card choice and fielder placement).
- UI layer: [src/ui](src/ui) (screens/components and DOM wiring).

Boundary rules:
- Keep domain and engine pure (no DOM access).
- Keep rule changes in domain/engine, not embedded in UI rendering.
- Prefer extending existing engine events over ad-hoc UI-only state.

## Determinism Rules
- Do not use Math.random() in domain/engine/AI logic.
- Use seeded RNG from [src/engine/rng.ts](src/engine/rng.ts) for reproducible behavior.
- If randomness behavior changes, update tests to keep deterministic expectations.

Note:
- [src/ui/App.ts](src/ui/App.ts) uses a one-off coin-flip RNG from Date.now() for pre-game reveal UX and seeds the game afterward.

## Coding Conventions
From [eslint.config.js](eslint.config.js) and [tsconfig.json](tsconfig.json):
- Use type-only imports where applicable.
- Prefix intentionally unused vars/params with _.
- Avoid console.log (only warn/error are allowed by lint rules).
- Respect strict TypeScript settings; do not bypass with broad any casts.

## Testing Expectations
- For engine/domain/AI changes, run at least: npm test.
- For UI flow changes, run: npm test and targeted Playwright specs under [e2e](e2e).
- Reproducibility is part of correctness: prefer fixed seeds in tests.

Common test entry points:
- Integration termination and full-loop simulation: [tests/integration.test.ts](tests/integration.test.ts)
- UI rendering helpers and escaping checks: [tests/ui-render.test.ts](tests/ui-render.test.ts)
- E2E setup flow and page-object usage: [e2e/setup.spec.ts](e2e/setup.spec.ts), [e2e/pages/SetupPage.ts](e2e/pages/SetupPage.ts)

## Known Product Constraints
Track and preserve current intended behavior unless asked otherwise:
- Sacrifice-fly tag-up flow is not fully implemented.
- On-field stolen base attempts are not implemented (card-based steals are).
- Regulation ties remain ties (no extra innings).
- Default error square behavior is documented in [README.md](README.md).

## Documentation Links
- Project overview and layout: [README.md](README.md)
- Full gameplay rules: [docs/rules.md](docs/rules.md)
- E2E test configuration: [playwright.config.ts](playwright.config.ts)
- Build and unit test configuration: [vite.config.ts](vite.config.ts)
