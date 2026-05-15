import type { BatterCard, PitcherCard } from "../domain/cards.ts";
import type { Coord, HitClassification } from "../domain/field.ts";
import type { Player, TeamSide } from "../domain/players.ts";

export type GameEvent =
  | { type: "GameStarted"; firstAtBat: TeamSide }
  | { type: "AtBatStarted"; offense: TeamSide; batter: Player }
  | { type: "PitchResolved"; batterCard: BatterCard; pitcherCard: PitcherCard }
  | { type: "StrikeOut"; batter: Player }
  | { type: "WalkIssued"; batter: Player }
  | { type: "NoPlay"; reason: string }
  | { type: "BallInPlay"; batter: Player }
  | { type: "HitDirection"; col: string }
  | { type: "HitDepth"; row: number }
  | { type: "HitClassified"; classification: HitClassification }
  | { type: "RunsScored"; runs: number; scorers: readonly Player[] }
  | { type: "OutsRecorded"; outs: number; reason?: string }
  | { type: "RunnerOut"; runner: Player; from: BaseLabel }
  | { type: "BatterAdvances"; batter: Player; to: BaseLabel | "Home" }
  | { type: "RunnerAdvances"; runner: Player; from: BaseLabel; to: BaseLabel | "Home" }
  | { type: "ErrorOnField"; landing: Coord }
  | { type: "HalfInningEnded"; inning: number; half: Half; runsThisHalf: number }
  | { type: "HandExhausted"; side: TeamSide; role: "batter" | "pitcher" }
  | { type: "HandsReplenished"; inning: number; half: Half }
  | { type: "GameOver"; reason: GameOverReason; winner: TeamSide | "Tie"; finalScore: { home: number; away: number } };

export type BaseLabel = "First" | "Second" | "Third";
export type Half = "Top" | "Bottom";

export type GameOverReason =
  | "InningsCompleted"
  | "HandExhausted";
