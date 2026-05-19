// English dictionary. The shape of this object is the canonical
// `Dictionary` type — every other locale must satisfy it.

export const en = {
  language: {
    name: "English",
    short: "EN",
  },
  switcher: {
    label: "Language",
  },
  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
  },

  // ── Setup screen ──
  setup: {
    title: "Game Setup",
    formatLabel: "Format",
    formatReduced: "Reduced (12 / 12)",
    formatClassic: "Classic (16 / 12)",
    inningsLabel: "Innings",
    yourTeam: "Your team",
    computerTeam: "Computer team",
    colNumber: "#",
    colName: "Name",
    colStrength: "Strength",
    colHanded: "Handed",
    playBall: "Play ball ⚾",
    compositionError:
      "{team} must have exactly 3 Light, 3 Medium, and 3 Heavy batters (have {light} Light, {medium} Medium, {heavy} Heavy).",
  },
  strength: {
    Light: "Light",
    Medium: "Medium",
    Heavy: "Heavy",
  },
  handedness: {
    Right: "Right",
    Left: "Left",
  },

  // ── Coin flip ──
  coinFlip: {
    title: "Coin flip",
    determining: "Determining who bats first…",
    youBatFirst: "You bat first.",
    computerBatsFirst: "Computer bats first.",
    wonToss: "{side} won the toss. {who}",
    home: "Home",
    away: "Away",
    playBall: "Play ball ⚾",
  },

  // ── Card phase ──
  cardPhase: {
    atBat: "At bat: {name} ({hand}HB, {strength})",
    youAreThe: "You are the {role}.",
    role: { batter: "batter", pitcher: "pitcher" },
    sideLabel: { batter: "Batter", pitcher: "Pitcher" },
    you: "You ({side})",
    computer: "Computer ({side})",
    pickCard: "Pick a card",
    thinking: "Thinking…",
    vs: "vs",
    continue: "Continue",
    yourHand: "Your hand ({role})",
  },

  // ── Field phase ──
  fieldPhase: {
    ballInPlay: "Ball in play! {name} ({hand}HB, {strength}) — {card}",
    placingHuman:
      "Click a fielder (F1–F7), then click a grid cell to move them. Pitcher (P) is auto-placed.",
    placingComputer: "Computer is placing fielders…",
    confirmFielders: "Confirm placement",
    resetFielders: "Reset",
    continue: "Continue",
    spinDirection: "🎯 Spin",
    spinDepth: "🎯 Spin",
    opponentSpinning: "Opponent spinning…",
    spinning: "Spinning…",
    directionTitle: "Direction (A–O)",
    depthTitle: "Depth (1–12)",
    directionPlaceholder: "Direction<br/>(A–O)",
    depthPlaceholder: "Depth<br/>(1–12)",
  },

  // ── Game over ──
  gameOver: {
    title: "Game Over",
    tie: "Tie game",
    teamWins: "{team} win",
    final: "Final: {away} {awayScore} — {home} {homeScore}",
    reasonInnings: "All innings completed.",
    reasonHand: "Hand exhausted.",
    newGame: "New game",
  },

  // ── Scoreboard ──
  scoreboard: {
    out: "OUT",
    outs: "OUTS",
    runs: "R",
    inningStatus: "{arrow} {ordinal}, {outs} {outsLabel}",
    ordinal: "{n}{suffix}",
  },

  // ── Batting order ──
  battingOrder: {
    title: "Batting Order",
  },

  // ── Event log / play-by-play ──
  eventLog: {
    title: "Play-by-play",
    gameStarted: "Game started — {side} bats first.",
    atBatStarted: "{name} ({hand}HB, {strength}) steps up.",
    pitchResolved: "Pitch: {pitcher} vs {batter}.",
    strikeOut: "STRIKE OUT — {name}.",
    walkIssued: "WALK — {name} takes first.",
    noPlay: "No play ({reason}).",
    ballInPlay: "Ball in play! {name} swings…",
    hitDirection: "Direction: column {col}.",
    hitDepth: "Depth: row {row}.",
    caughtAt: "Caught — out at {col}{row}.",
    single: "SINGLE.",
    double: "DOUBLE.",
    triple: "TRIPLE.",
    homeRun: "HOME RUN!",
    homeRunInsidePark: "HOME RUN (inside the park)!",
    error: "ERROR on the field.",
    runScored: "Run scored: {names}.",
    runsScored: "Runs scored: {names}.",
    outRecorded: "Out recorded.",
    outRecordedReason: "Out recorded ({reason}).",
    runnerOut: "Runner out: {name} from {from}.",
    batterAdvances: "{name} → {to}.",
    runnerAdvances: "{name}: {from} → {to}.",
    errorOnField: "Error at {col}{row}.",
    halfInningEnded: "End of {half} {inning}: {runs} {label}.",
    runsLabelOne: "run",
    runsLabelOther: "runs",
    handExhausted: "{side} ran out of {role} cards.",
    handsReplenished: "Hands replenished for {half} {inning}.",
    gameOverTie: "GAME OVER — tie {away}–{home}.",
    gameOverWin: "GAME OVER — {winner} wins {away}–{home}.",
  },

  // ── Card labels (artwork stays language-independent) ──
  cards: {
    batter: {
      HighSwing: "High Swing",
      LowSwing: "Low Swing",
      FlatSwing: "Flat Swing",
      HitAndRun: "Hit & Run",
      Walk: "Walk",
      StolenBase: "Stolen Base",
      Sacrifice: "Sacrifice",
      Box: "Box",
    },
    pitcher: {
      FastHigh: "High Fastball",
      FastLow: "Low Fastball",
      FastInside: "Inside Fastball",
      CurveHigh: "High Curve",
      CurveLow: "Low Curve",
      CurveOutside: "Outside Curve",
      SliderHigh: "High Slider",
      SliderLow: "Low Slider",
      SliderInside: "Inside Slider",
      NoPitch: "No Pitch",
    },
  },

  // ── Bases ──
  bases: {
    First: "First",
    Second: "Second",
    Third: "Third",
    Home: "Home",
  },

  // ── Sides ──
  sides: {
    Home: "Home",
    Away: "Away",
  },

  // ── Halves ──
  halves: {
    Top: "Top",
    Bottom: "Bottom",
  },

  // ── Navigation ──
  nav: {
    instructions: "How to Play",
    hittingTable: "Hitting Table",
  },

  // ── Modal ──
  modal: {
    close: "Close",
  },

  // ── Instructions modal ──
  instructions: {
    title: "How to Play",
    s1Title: "Cards",
    s1Body:
      "Each half-inning both players draw a full hand. The batter picks from: High Swing, Low Swing, Flat Swing, Hit & Run, Walk, Stolen Base, Sacrifice, and Box. The pitcher picks from: High Fastball, Low Fastball, Inside Fastball, High Curve, Low Curve, Outside Curve, High Slider, Low Slider, Inside Slider, and No Pitch (×3).",
    s2Title: "Card matchups — congruence",
    s2Body:
      "When both players reveal their card the Hitting Table decides the result: H (hit — ball goes to the field), SO (strike out), BB (walk), or — (no play, both cards are burned). Played cards are discarded; hands are only replenished at the start of the next half-inning.",
    s3Title: "Special cards",
    s3Walk: "Walk — the batter takes a base or strikes out; no field play.",
    s3Sacrifice:
      "Sacrifice — advances a runner to the next base; the batter is always out. If no runner is on base, it behaves like a swing.",
    s3StolenBase:
      "Stolen Base — the runner is safe only against Outside Curve, Inside Fastball, or Inside Slider; all other pitches catch the runner out.",
    s3HitAndRun:
      "Hit & Run — with runners on base they start moving; a hit advances them one extra base. If it strikes out (not 3rd out), the pitcher must try to throw out a runner. Breaks up the double play.",
    s3Box:
      "Box — if the pitcher plays No Pitch, the batter earns a walk. Against any other pitch there is no play.",
    s3NoPitch:
      "No Pitch — only Box beats it (walk); swings and most strategy cards burn. If batter plays Hit & Run, the lead runner is thrown out and the batter stays up.",
    s4Title: "The field",
    s4Body:
      "Direction runs A (left-field line) → O (right-field line); center is H. Depth runs 1 (pitcher level) → 12 (home run over the fence). Spin the direction arrow then the depth arrow to find where the ball lands.",
    s5Title: "Batters",
    s5Body:
      "Strength (Light / Medium / Heavy) affects the depth spinner probabilities — Light batters tend to hit shorter, Heavy batters farther. Handedness (Right / Left) affects the direction spinner — right-handed batters pull toward left field, left-handed toward right field.",
    s6Title: "Fielding — making outs",
    s6Body:
      "Each fielder covers the 3×3 grid centred on their position (one square in every direction). The pitcher at H1 also covers H1 (one step in every direction). Any ball landing inside a fielder's zone is an out.",
    s7Title: "Hit types",
    s7Single: "Single — ball lands 1 diagonal step beyond any fielder.",
    s7Double: "Double — 2 diagonal steps beyond.",
    s7Triple: "Triple — 3 diagonal steps beyond.",
    s7HomeRun:
      "Home Run — ball reaches depth 12 (over the fence), or lands 4+ steps from every fielder (inside-the-park HR).",
    s8Title: "Errors",
    s8Body:
      "If the ball lands on the error square (usually between B and C), the batter and all runners advance one base — it counts like a hit for Hit & Run purposes.",
  },

  // ── Hitting table modal ──
  hittingTable: {
    title: "Hitting Table",
    batter: "Batter card",
    pitcher: "Pitcher card",
    legendTitle: "Legend",
    legendH: "H — Hit (ball goes to the field)",
    legendSO: "SO — Strike Out",
    legendBB: "BB — Walk (Base on Balls)",
    legendSAC: "SAC — Sacrifice connects (batter still out)",
    legendNoPlay: "— — No play (both cards burned)",
    legendStealSafe: "✓ — Stolen base: runner safe",
    legendStealCaught: "✗ — Stolen base: runner out",
    legendStealNoPitch: "★ — No Pitch vs Steal: lead runner thrown out, batter stays up",
    legendHitRunNoPitch: "† — Hit & Run vs No Pitch: lead runner thrown out, batter stays up",
  },
} as const;

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? readonly WidenStrings<T[number]>[]
    : { [K in keyof T]: WidenStrings<T[K]> };

export type Dictionary = WidenStrings<typeof en>;
