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
    hits: "H",
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

  nav: {
    instructions: "Cómo jugar",
    hittingTable: "Tabla de bateo",
  },

  modal: {
    close: "Cerrar",
  },

  instructions: {
    title: "Cómo jugar",
    s1Title: "Cartas",
    s1Body:
      "Al inicio de cada media entrada ambos jugadores reciben una mano completa. El bateador elige entre: Swing Alto, Swing Bajo, Swing Plano, Toque y Corre, Base por Bolas, Base Robada, Sacrificio y Caja. El lanzador elige entre: Recta Alta, Recta Baja, Recta Pegada, Curva Alta, Curva Baja, Curva Afuera, Slider Alto, Slider Bajo, Slider Pegado y Sin Lanzamiento (×3).",
    s2Title: "Enfrentamiento de cartas — congruencia",
    s2Body:
      "Cuando ambos jugadores revelan su carta, la Tabla de Bateo determina el resultado: H (hit — la pelota va al campo), SO (ponche), BB (base por bolas) o — (sin jugada, ambas cartas se queman). Las cartas jugadas se descartan; las manos se reponen únicamente al inicio de la siguiente media entrada.",
    s3Title: "Cartas especiales",
    s3Walk: "Base por Bolas — el bateador toma la base o se poncha; no hay jugada en el campo.",
    s3Sacrifice:
      "Sacrificio — avanza un corredor a la siguiente base; el bateador siempre es out. Si no hay corredores, funciona como un swing.",
    s3StolenBase:
      "Base Robada — el corredor es salvo solo contra Curva Afuera, Recta Pegada o Slider Pegado; con cualquier otro lanzamiento el corredor es out.",
    s3HitAndRun:
      "Toque y Corre — con corredores en base estos arrancan; un hit los avanza una base extra. Si se poncha (sin ser el 3.er out), el lanzador debe intentar sacar a un corredor. Rompe el doble play.",
    s3Box:
      "Caja — si el lanzador juega Sin Lanzamiento, el bateador recibe base por bolas. Contra cualquier otro lanzamiento no hay jugada.",
    s3NoPitch:
      "Sin Lanzamiento — solo la Caja la vence (base por bolas); los swings y la mayoría de las cartas de estrategia se queman. Si el bateador juega Toque y Corre, el corredor líder es puesto out y el mismo bateador continúa.",
    s4Title: "El campo",
    s4Body:
      "La dirección va de A (línea de jardín izquierdo) → O (línea de jardín derecho); el centro es H. La profundidad va de 1 (nivel del lanzador) → 12 (jonrón sobre la barda). Se gira la flecha de dirección y luego la de profundidad para determinar dónde cae la pelota.",
    s5Title: "Bateadores",
    s5Body:
      "La fuerza (Ligero / Medio / Pesado) afecta las probabilidades del girador de profundidad: los bateadores Ligeros tienden a golpear corto, los Pesados más largo. La lateralidad (Derecho / Zurdo) afecta el girador de dirección: los derechos jalan hacia el jardín izquierdo, los zurdos hacia el derecho.",
    s6Title: "Defensa — cómo hacer outs",
    s6Body:
      "Cada jugador de cuadro cubre la cuadrícula de 3×3 centrada en su posición (un cuadro en cada dirección). El lanzador en H1 también cubre H1. Cualquier pelota que caiga dentro de la zona de un jugador es un out.",
    s7Title: "Tipos de hit",
    s7Single: "Sencillo — la pelota cae 1 paso diagonal más allá de cualquier jugador.",
    s7Double: "Doble — 2 pasos diagonales más allá.",
    s7Triple: "Triple — 3 pasos diagonales más allá.",
    s7HomeRun:
      "Jonrón — la pelota alcanza la profundidad 12 (sobre la barda), o cae 4+ pasos de cada jugador (jonrón dentro del parque).",
    s8Title: "Errores",
    s8Body:
      "Si la pelota cae en el cuadro de error (generalmente entre B y C), el bateador y todos los corredores avanzan una base — cuenta como hit para efectos del Toque y Corre.",
  },

  hittingTable: {
    title: "Tabla de bateo",
    batter: "Carta del bateador",
    pitcher: "Carta del lanzador",
    legendTitle: "Leyenda",
    legendH: "H — Hit (la pelota va al campo)",
    legendSO: "SO — Ponche",
    legendBB: "BB — Base por Bolas",
    legendSAC: "SAC — Sacrificio conectado (bateador siempre out)",
    legendNoPlay: "— — Sin jugada (ambas cartas se queman)",
    legendStealSafe: "✓ — Base robada: corredor salvo",
    legendStealCaught: "✗ — Base robada: corredor out",
    legendStealNoPitch: "★ — Sin Lanzamiento vs Robo: corredor líder puesto out, bateador continúa",
    legendHitRunNoPitch: "† — Toque y Corre vs Sin Lanzamiento: corredor líder puesto out, bateador continúa",
  },
};
