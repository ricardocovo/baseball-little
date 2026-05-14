# Table Baseball-Little

Table Baseball-Little is a browser implementation of the tabletop card game.
You play a full game against a smart-random computer opponent with deterministic,
seed-driven gameplay logic.

Rules source of truth: [docs/rules.md](docs/rules.md)

## Features

- Setup flow for deck format, innings, and lineup customization
- Card matchup phase based on congruence table outcomes
- Field placement and spin-based ball-in-play resolution
- Deterministic game engine and reproducible simulations
- Computer AI for card choice and fielder placement

## Tech stack

- TypeScript + Vite
- Vitest for unit and integration testing
- Playwright for end-to-end testing
- ESLint with flat config

## Quick start

```bash
npm install
npm run dev
```

Local dev server defaults to `http://localhost:5173`.

## Scripts

```bash
npm run dev         # run Vite dev server
npm run build       # type-check and build for production (dist/)
npm run preview     # preview production build
npm run lint        # lint project
npm test            # run Vitest once
npm run test:watch  # run Vitest in watch mode
npm run test:e2e    # run Playwright e2e suite
```

## Gameplay flow

1. Setup
  Choose deck format (Reduced 12/12 or Classic 16/12), innings (3/6/9), and
  lineups.
2. Coin flip
  Decides who bats first.
3. Card phase
  Both sides select cards, reveal simultaneously, and resolve by congruence.
4. Field phase
  On balls in play, defenders place fielders and a spin resolves result by
  nearest fielder, fence, and error square rules.
5. End game
  Game ends after configured innings or when a side runs out of cards.

For complete rules and special plays, see [docs/rules.md](docs/rules.md).

## Project structure

```text
src/
  domain/   pure types and rule tables
  engine/   deterministic state machine, events, runner logic, RNG
  ai/       card selection and fielding decisions
  ui/       screens, components, and DOM wiring
  styles/   CSS
tests/      unit and integration tests
e2e/        Playwright tests
docs/       game rules documentation
```

## Architecture boundaries

- Keep rule data in `src/domain` and game logic in `src/engine`
- Keep `src/domain`, `src/engine`, and `src/ai` free of DOM access
- Prefer engine events over UI-only ad-hoc state for gameplay changes

## Determinism and RNG

- Do not use `Math.random()` in domain, engine, or AI logic
- Use the seeded RNG in `src/engine/rng.ts` for reproducible behavior
- If randomness behavior changes, update tests with fixed-seed expectations

Note: `src/ui/App.ts` uses a one-off reveal RNG before the game is seeded.

## Testing guidance

- Engine, domain, or AI changes: run `npm test`
- UI flow changes: run `npm test` and relevant Playwright specs in `e2e/`

Useful entry points:

- Integration/full-loop simulation: [tests/integration.test.ts](tests/integration.test.ts)
- UI rendering and escaping checks: [tests/ui-render.test.ts](tests/ui-render.test.ts)
- Setup flow e2e: [e2e/setup.spec.ts](e2e/setup.spec.ts)

## Known constraints

- Sacrifice-fly tag-up flow is not fully implemented
- On-field stolen base attempts are not implemented (card-based steals are)
- Regulation ties stay ties (no extra innings)
- Default error square behavior is documented and currently defaults to `B3`
