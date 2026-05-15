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
} as const;

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? readonly WidenStrings<T[number]>[]
    : { [K in keyof T]: WidenStrings<T[K]> };

export type Dictionary = WidenStrings<typeof en>;
