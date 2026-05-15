import type { Dictionary } from "./en.ts";

export const es: Dictionary = {
  language: {
    name: "Español",
    short: "ES",
  },
  switcher: {
    label: "Idioma",
  },
  theme: {
    label: "Tema",
    light: "Claro",
    dark: "Oscuro",
  },

  setup: {
    title: "Configuración del partido",
    formatLabel: "Formato",
    formatReduced: "Reducido (12 / 12)",
    formatClassic: "Clásico (16 / 12)",
    inningsLabel: "Entradas",
    yourTeam: "Tu equipo",
    computerTeam: "Equipo de la computadora",
    colNumber: "#",
    colName: "Nombre",
    colStrength: "Fuerza",
    colHanded: "Brazo",
    playBall: "¡A jugar! ⚾",
    compositionError:
      "{team} debe tener exactamente 3 Ligeros, 3 Medios y 3 Pesados (tiene {light} Ligeros, {medium} Medios, {heavy} Pesados).",
  },
  strength: {
    Light: "Ligero",
    Medium: "Medio",
    Heavy: "Pesado",
  },
  handedness: {
    Right: "Derecho",
    Left: "Zurdo",
  },

  coinFlip: {
    title: "Lanzamiento de moneda",
    determining: "Decidiendo quién batea primero…",
    youBatFirst: "Bateas tú primero.",
    computerBatsFirst: "La computadora batea primero.",
    wonToss: "{side} ganó el sorteo. {who}",
    home: "Local",
    away: "Visitante",
    playBall: "¡A jugar! ⚾",
  },

  cardPhase: {
    atBat: "Al bate: {name} ({hand}HB, {strength})",
    youAreThe: "Eres el {role}.",
    role: { batter: "bateador", pitcher: "lanzador" },
    sideLabel: { batter: "Bateador", pitcher: "Lanzador" },
    you: "Tú ({side})",
    computer: "Computadora ({side})",
    pickCard: "Elige una carta",
    thinking: "Pensando…",
    vs: "vs",
    continue: "Continuar",
    yourHand: "Tu mano ({role})",
  },

  fieldPhase: {
    ballInPlay: "¡Pelota en juego! {name} ({hand}HB, {strength}) — {card}",
    placingHuman:
      "Haz clic en un jugador (F1–F7) y luego en una casilla para moverlo. El lanzador (P) se ubica solo.",
    placingComputer: "La computadora está ubicando a los jugadores…",
    confirmFielders: "Confirmar ubicación",
    resetFielders: "Reiniciar",
    continue: "Continuar",
    spinDirection: "🎯 Girar",
    spinDepth: "🎯 Girar",
    opponentSpinning: "El rival está girando…",
    spinning: "Girando…",
    directionTitle: "Dirección (A–O)",
    depthTitle: "Profundidad (1–12)",
    directionPlaceholder: "Dirección<br/>(A–O)",
    depthPlaceholder: "Profundidad<br/>(1–12)",
  },

  gameOver: {
    title: "Fin del juego",
    tie: "Empate",
    teamWins: "Gana {team}",
    final: "Final: {away} {awayScore} — {home} {homeScore}",
    reasonInnings: "Todas las entradas completadas.",
    reasonHand: "Mano agotada.",
    newGame: "Nuevo juego",
  },

  scoreboard: {
    out: "OUT",
    outs: "OUTS",
    runs: "C",
    inningStatus: "{arrow} {ordinal}, {outs} {outsLabel}",
    ordinal: "{n}.{suffix}",
  },

  battingOrder: {
    title: "Orden al bate",
  },

  eventLog: {
    title: "Jugada a jugada",
    gameStarted: "Comienza el juego — batea primero {side}.",
    atBatStarted: "{name} ({hand}HB, {strength}) se acerca al plato.",
    pitchResolved: "Lanzamiento: {pitcher} vs {batter}.",
    strikeOut: "PONCHADO — {name}.",
    walkIssued: "BASE POR BOLAS — {name} toma la primera.",
    noPlay: "Sin jugada ({reason}).",
    ballInPlay: "¡Pelota en juego! {name} batea…",
    hitDirection: "Dirección: columna {col}.",
    hitDepth: "Profundidad: fila {row}.",
    caughtAt: "Atrapada — out en {col}{row}.",
    single: "SENCILLO.",
    double: "DOBLE.",
    triple: "TRIPLE.",
    homeRun: "¡JONRÓN!",
    homeRunInsidePark: "¡JONRÓN (dentro del parque)!",
    error: "ERROR en el terreno.",
    runScored: "Carrera anotada: {names}.",
    runsScored: "Carreras anotadas: {names}.",
    outRecorded: "Out registrado.",
    outRecordedReason: "Out registrado ({reason}).",
    runnerOut: "Corredor out: {name} desde {from}.",
    batterAdvances: "{name} → {to}.",
    runnerAdvances: "{name}: {from} → {to}.",
    errorOnField: "Error en {col}{row}.",
    halfInningEnded: "Fin de {half} {inning}: {runs} {label}.",
    runsLabelOne: "carrera",
    runsLabelOther: "carreras",
    handExhausted: "{side} se quedó sin cartas de {role}.",
    handsReplenished: "Manos repuestas para {half} {inning}.",
    gameOverTie: "FIN DEL JUEGO — empate {away}–{home}.",
    gameOverWin: "FIN DEL JUEGO — gana {winner} {away}–{home}.",
  },

  cards: {
    batter: {
      HighSwing: "Swing Alto",
      LowSwing: "Swing Bajo",
      FlatSwing: "Swing Plano",
      HitAndRun: "Toque y Corre",
      Walk: "Base por Bolas",
      StolenBase: "Base Robada",
      Sacrifice: "Sacrificio",
      Box: "Caja",
    },
    pitcher: {
      FastHigh: "Recta Alta",
      FastLow: "Recta Baja",
      FastInside: "Recta Pegada",
      CurveHigh: "Curva Alta",
      CurveLow: "Curva Baja",
      CurveOutside: "Curva Afuera",
      SliderHigh: "Slider Alto",
      SliderLow: "Slider Bajo",
      SliderInside: "Slider Pegado",
      NoPitch: "Sin Lanzamiento",
    },
  },

  bases: {
    First: "Primera",
    Second: "Segunda",
    Third: "Tercera",
    Home: "Home",
  },

  sides: {
    Home: "Local",
    Away: "Visitante",
  },

  halves: {
    Top: "Alta",
    Bottom: "Baja",
  },
};
