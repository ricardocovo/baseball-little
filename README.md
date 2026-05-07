# Table Baseball-Little

A web implementation of the Table Baseball-Little tabletop card game (see
[`docs/rules.md`](docs/rules.md)). Single player vs. a "smart-random"
computer opponent.

## Tech stack

- Vanilla TypeScript + Vite
- Vitest (unit + integration tests)
- ESLint (flat config)

## Getting started

```bash
npm install
npm run dev      # local dev server (default: http://localhost:5173)
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run lint     # ESLint
npm test         # Vitest run
```

## How to play

1. **Setup** — pick deck format (Reduced 12/12 or Classic 16/12), innings
   (3, 6, or 9), and edit your 9-player lineup (each player has Strength
   and Handedness). The computer's lineup is auto-generated and editable.
2. **Coin flip** — randomly decides who bats first (top of the 1st).
3. **Card phase** — pick one card from your hand each at-bat. The
   computer simultaneously picks one of its own. Both reveal at the same
   time and the matchup is resolved against the congruence table
   (strikeout, walk, no play, special play, or ball in play).
4. **Field phase** — when there's a hit:
   - The defender (you or the computer) places 8 fielders on the
     A–O × 1–12 grid (the pitcher is auto-placed for batter handedness).
   - The batter spins direction (column) and depth (row).
   - Distance from the nearest fielder determines out / single / double /
     triple / home run; the fence (row 12) and the configured error square
     are also taken into account.
5. **Game end** — game ends when the configured number of innings is played
   or either side runs out of cards. Hands are not replenished.

See [`docs/rules.md`](docs/rules.md) for the full rules, including special
plays (Hit & Run, Sacrifice, Stolen Base, Box / No Pitch).

## Project layout

```
src/
  domain/    pure types & data: cards, congruence table, field, players, spinners
  engine/    deterministic game state machine + event stream + RNG
  ai/        opponent: smart-random card choice + fielder placement
  ui/        DOM rendering & interaction (App + screens + components)
  styles/    main.css
tests/       Vitest specs (unit + integration full-game simulation)
docs/        rules.md
```

`domain`, `engine`, and `ai` are pure TypeScript — no DOM, no global
randomness. All randomness flows through a seeded RNG so games are
reproducible and tests are deterministic.

## Notes & deferred work

- Sacrifice fly tag-up flow on the field is not yet implemented (rules
  examples are sparse).
- On-field stolen base attempts are not implemented (only stolen-base
  cards).
- A tie at the end of regulation is recorded as a tie (no extra innings).
- The default error square is fixed at `B3` (configurable in
  [`src/domain/field.ts`](src/domain/field.ts)).
