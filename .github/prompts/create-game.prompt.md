---
description: "Scaffold and build the Table Baseball-Little card game as a web application using the rules in docs/"
agent: "plan"
---

# Create Table Baseball-Little Game

Build a web-based implementation of the Table Baseball-Little tabletop card game.

## Source of Truth

Read and follow all game rules defined in [rules](../../docs/rules.md). The field layout image is at [Field](../../docs/Field.jpeg). These are the authoritative references — do not invent mechanics.

## Core Systems to Implement

1. **Card System** — Batter cards (High/Low/Flat Swing, Hit & Run, Walk, Stolen Base, Sacrifice, Box) and Pitcher cards (High/Low/Inside Fastball, High/Low/Outside Curve, High/Low/Inside Slider, No Pitch). Support both Classic (16 batter / 12 pitcher) and Reduced (12/12) formats.

2. **Congruence Table** — Resolve card matchups into outcomes (Hit, Strike Out, Base on Balls, No Play, or special rules) exactly as defined in the rules.

3. **Playing Field** — Direction (A–O) and Depth (1–12) grid. Implement spinners for hit direction (right/left-handed) and hit depth (Light/Medium/Heavy batter).

4. **Fielder Positioning** — 8 fielders placed on the grid by the defensive player. Each fielder covers a 3×3 area around their position. Determine outs vs hits based on distance (1 step = single, 2 = double, 3 = triple, 4+ or over fence = HR).

5. **Special Plays** — Hit & Run (extra base advance, breaks double play), Stolen Base (card and field variants), Sacrifice (batter out, runners advance), Box vs No Pitch interaction, errors, sacrifice flies/tag-ups.

6. **Regular Game** — Innings, outs, batting order, base runner tracking, scoring.

## Game Flow UI
 
 Having everything on one page is too busy. So the users will start with only the card portion of the game. If the user actually hits the ball, then we will show the playing field and let them position their fielders. After the play is resolved, we will hide the field again and go back to the card portion for the next at-bat. This way we can keep the UI simple and focused on the current action.

## Player Attributes

- **Strength**: Light, Medium, Heavy (affects depth spinner)
- **Handedness**: Right, Left (affects direction spinner)

## Guidelines

- Start with project scaffolding and architecture decisions
- Prioritize game logic/engine before UI
- Keep the UI simple — the field grid, card hands, and scoreboard
- Make the game two-player local (no AI opponent needed initially)
