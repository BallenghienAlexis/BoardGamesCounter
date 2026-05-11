import type { GameMode } from './SkullKing';

export interface PlayerGameStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  wins: number;
  losses: number;
  totalScore: number;
  avgScore: number;
  bestScore: number;
  worstScore: number;
  winRate: number; // percentage (0-100)
}

export interface GameModeStats {
  mode: GameMode;
  totalGames: number;
  totalPlayers: number;
  playerStats: Record<string, PlayerGameStats>; // playerId -> stats
}

export interface OverallStats {
  totalGamesPlayed: number;
  favoriteMode: GameMode | null;
  stats: Record<GameMode, GameModeStats>; // mode -> stats
  playerStats: Record<string, PlayerGameStats>; // playerId -> overall stats
}

export interface PlayerGameResult {
  playerId: string;
  playerName: string;
  finalScore: number;
  rank: number; // 1st, 2nd, etc.
  isWinner: boolean;
  gameMode: GameMode;
  timestamp: string; // ISO string
  gameId: string;
}

