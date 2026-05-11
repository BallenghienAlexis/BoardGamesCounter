// Types pour Skull King

export type GameMode = 'base' | 'base-extension' | 'incremental';
export type ScoringSystem = 'skull-king' | 'rascal';

export interface SkullKingGameConfig {
  mode: GameMode;
  scoringSystem: ScoringSystem;
  includeKraken: boolean;
  includeWhaleWhite: boolean;
  includePiratesPowers: boolean;
  cardsPerRound: number[]; // Array of cards for each round (1-10)
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
  siblingCapturedByPirate: number; // +20
  pirateCapturedBySkullKing: number; // +30
  sirenCapturedSkullKing: number; // +40
  spiritCapturedBySecond: number; // +30 if captured
  treasureAlliance: number; // +20 if both correct
  raieBonus: number; // depends on rules
}

export interface SkullKingGameState {
  gameId: string;
  players: { id: string; name: string }[];
  config: SkullKingGameConfig;
  currentRound: number;
  rounds: SkullKingRound[];
  playerScores: Record<string, number>; // playerId -> total score
}

