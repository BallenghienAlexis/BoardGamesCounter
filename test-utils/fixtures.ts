// Données de test réutilisables.
import type { GameMode, SkullKingGameConfig, SkullKingGameState, SkullKingRound } from '@/src/types/SkullKing';

export function makeConfig(overrides: Partial<SkullKingGameConfig> = {}): SkullKingGameConfig {
  return {
    mode: 'base',
    scoringSystem: 'skull-king',
    includeKraken: false,
    includeWhaleWhite: false,
    includePiratesPowers: false,
    include7And8: false,
    cardsPerRound: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    playerCount: 3,
    ...overrides,
  };
}

export const PLAYERS = [
  { id: 'player_0', name: 'Alice' },
  { id: 'player_1', name: 'Bob' },
  { id: 'player_2', name: 'Chloé' },
];

export function makeRound(roundNumber: number, roundScores: Record<string, number> = {}): SkullKingRound {
  return {
    roundNumber,
    cardsDistributed: roundNumber,
    playerBets: {},
    playerTricks: {},
    roundScores,
    bonuses: {},
  };
}

export function makeGame(overrides: Partial<SkullKingGameState> & { mode?: GameMode } = {}): SkullKingGameState {
  const { mode, ...rest } = overrides;
  const players = rest.players ?? PLAYERS;
  return {
    gameId: '1700000000000',
    players,
    config: makeConfig(mode ? { mode } : {}),
    currentRound: 1,
    rounds: [makeRound(1)],
    playerScores: Object.fromEntries(players.map(p => [p.id, 0])),
    ...rest,
  };
}
