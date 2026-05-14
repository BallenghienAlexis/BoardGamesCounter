// Types pour Skull King

export type GameMode = 'base' | 'base-extension' | 'incremental' | 'rascal';
export type ScoringSystem = 'skull-king' | 'rascal';
export type RascalVariant = 'chevrotine' | 'boulet-de-canon';
export type PlayerCount = 2 | 3 | 4 | 5 | 6;

export interface SkullKingGameConfig {
  mode: GameMode;
  scoringSystem: ScoringSystem;
  includeKraken: boolean;
  includeWhaleWhite: boolean;
  includePiratesPowers: boolean;
  include7And8: boolean;
  cardsPerRound: number[]; // Array of cards for each round (1-10)
  playerCount: PlayerCount;
  twoPlayerVariant?: boolean; // Ghost of Grey Beard rule
  rascalVariant?: RascalVariant; // Chevrotine or Boulet de canon
}

export interface SkullKingRound {
  roundNumber: number;
  cardsDistributed: number;
  playerBets: Record<string, number>; // playerId -> bet
  playerTricks: Record<string, number>; // playerId -> tricks won
  roundScores: Record<string, number>; // playerId -> score this round
  bonuses: Record<string, RoundBonus>; // playerId -> bonuses
}

export interface RoundBonus {
  card14Regular: number; // +10 per regular 14
  card14Black: number; // +20 for black 14
  sirenCapturedByPirate: number; // +20
  pirateCapturedBySkullKing: number; // +30
  sirenCapturedSkullKing: number; // +40
  spiritCapturedBySecond: number; // +30 if captured
  treasureAlliance: number | TreasureAllianceBonus[]; // Can be count or detailed alliances
  raieBonus: number; // depends on rules
  secondCaptured: number; // +30 if le Second is captured
  davyJonesCasketCount: number; // +20 per leviathan destroyed
  sevenCardBonus: number; // -5 pts per 7 won (extension only)
  eightCardBonus: number; // +5 pts per 8 won (extension only)
}

export interface TreasureAllianceBonus {
  playedBy: string; // ID of player who played the treasure card
  wonBy: string; // ID of player who won the trick with treasure
  bothCorrect?: boolean; // Both players bet correctly (calculated)
}

export interface SkullKingGameState {
  gameId: string;
  players: { id: string; name: string }[];
  config: SkullKingGameConfig;
  currentRound: number;
  rounds: SkullKingRound[];
  playerScores: Record<string, number>; // playerId -> total score
}

