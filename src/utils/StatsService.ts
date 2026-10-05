import { storageService } from './StorageService';
import type { PlayerGameResult, OverallStats, GameModeStats, PlayerGameStats } from '../types/Stats';
import type { GameMode } from '../types/SkullKing';

const STATS_STORAGE_KEY = 'skull_king_game_stats';

// Anciennes versions : stats indexées par id positionnel (player_0…), qui désignait des
// personnes différentes d'une partie à l'autre. On les ré-indexe par nom à la lecture.
const LEGACY_POSITIONAL_ID = /^player_\d+$/;

function mergePlayerStats(a: PlayerGameStats, b: PlayerGameStats): PlayerGameStats {
  const totalGames = a.totalGames + b.totalGames;
  const wins = a.wins + b.wins;
  const totalScore = a.totalScore + b.totalScore;
  return {
    playerId: a.playerId,
    playerName: a.playerName,
    totalGames,
    wins,
    losses: a.losses + b.losses,
    totalScore,
    avgScore: totalGames > 0 ? totalScore / totalGames : 0,
    bestScore: Math.max(a.bestScore, b.bestScore),
    worstScore: Math.min(a.worstScore, b.worstScore),
    winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
  };
}

function rekeyLegacyPlayerStats(playerStats: Record<string, PlayerGameStats>): Record<string, PlayerGameStats> {
  const result: Record<string, PlayerGameStats> = {};
  Object.entries(playerStats).forEach(([key, value]) => {
    const newKey = LEGACY_POSITIONAL_ID.test(key) && value.playerName ? value.playerName : key;
    const entry = { ...value, playerId: newKey };
    result[newKey] = result[newKey] ? mergePlayerStats(result[newKey], entry) : entry;
  });
  return result;
}

/** Lecture tolérante des stats enregistrées par les versions précédentes. */
function normalizeStats(stats: OverallStats): OverallStats {
  const modes = Object.fromEntries(
    Object.entries(stats.stats ?? {}).map(([mode, modeStats]) => [
      mode,
      { ...modeStats, playerStats: rekeyLegacyPlayerStats(modeStats.playerStats ?? {}) },
    ])
  ) as OverallStats['stats'];
  return { ...stats, stats: modes, playerStats: rekeyLegacyPlayerStats(stats.playerStats ?? {}) };
}

export const statsService = {
  /**
   * Enregistrer le résultat d'une partie (appelé quand la partie se termine)
   */
  async recordGameResult(
    gameId: string,
    gameMode: GameMode,
    playerResults: PlayerGameResult[]
  ): Promise<void> {
    try {
      const stats = await this.getStats();

      // Une partie n'est comptée qu'une fois, même si l'écran de fin est réaffiché
      const recordedGameIds = stats.recordedGameIds ?? [];
      if (recordedGameIds.includes(gameId)) {
        return;
      }
      stats.recordedGameIds = [...recordedGameIds, gameId];

      // Initialize mode stats if not exists
      if (!stats.stats[gameMode]) {
        stats.stats[gameMode] = {
          mode: gameMode,
          totalGames: 0,
          totalPlayers: 0,
          playerStats: {},
        };
      }

      const modeStats = stats.stats[gameMode];
      modeStats.totalGames += 1;
      modeStats.totalPlayers += playerResults.length;

      // Update player stats
      playerResults.forEach(result => {
        if (!stats.playerStats[result.playerId]) {
          stats.playerStats[result.playerId] = {
            playerId: result.playerId,
            playerName: result.playerName,
            totalGames: 0,
            wins: 0,
            losses: 0,
            totalScore: 0,
            avgScore: 0,
            bestScore: result.finalScore,
            worstScore: result.finalScore,
            winRate: 0,
          };
        }

        const playerGlobalStats = stats.playerStats[result.playerId];
        playerGlobalStats.totalGames += 1;
        playerGlobalStats.totalScore += result.finalScore;
        playerGlobalStats.bestScore = Math.max(playerGlobalStats.bestScore, result.finalScore);
        playerGlobalStats.worstScore = Math.min(playerGlobalStats.worstScore, result.finalScore);
        playerGlobalStats.avgScore = playerGlobalStats.totalScore / playerGlobalStats.totalGames;

        if (result.isWinner) {
          playerGlobalStats.wins += 1;
        } else {
          playerGlobalStats.losses += 1;
        }

        playerGlobalStats.winRate = (playerGlobalStats.wins / playerGlobalStats.totalGames) * 100;

        // Update mode-specific stats
        if (!modeStats.playerStats[result.playerId]) {
          modeStats.playerStats[result.playerId] = {
            playerId: result.playerId,
            playerName: result.playerName,
            totalGames: 0,
            wins: 0,
            losses: 0,
            totalScore: 0,
            avgScore: 0,
            bestScore: result.finalScore,
            worstScore: result.finalScore,
            winRate: 0,
          };
        }

        const playerModeStats = modeStats.playerStats[result.playerId];
        playerModeStats.totalGames += 1;
        playerModeStats.totalScore += result.finalScore;
        playerModeStats.bestScore = Math.max(playerModeStats.bestScore, result.finalScore);
        playerModeStats.worstScore = Math.min(playerModeStats.worstScore, result.finalScore);
        playerModeStats.avgScore = playerModeStats.totalScore / playerModeStats.totalGames;

        if (result.isWinner) {
          playerModeStats.wins += 1;
        } else {
          playerModeStats.losses += 1;
        }

        playerModeStats.winRate = (playerModeStats.wins / playerModeStats.totalGames) * 100;
      });

      // Update overall total
      stats.totalGamesPlayed += 1;

      // Find favorite mode
      let maxGames = 0;
      let favoriteMode: GameMode | null = null;
      Object.values(stats.stats).forEach(modeData => {
        if (modeData.totalGames > maxGames) {
          maxGames = modeData.totalGames;
          favoriteMode = modeData.mode;
        }
      });
      stats.favoriteMode = favoriteMode;

      // Save updated stats
      await storageService.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.warn('Could not record game result:', error);
    }
  },

  /**
   * Récupérer toutes les stats
   */
  async getStats(): Promise<OverallStats> {
    try {
      const stored = await storageService.getItem(STATS_STORAGE_KEY);
      if (stored) {
        return normalizeStats(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Could not load stats:', error);
    }

    // Retourner les stats vides par défaut
    return {
      totalGamesPlayed: 0,
      favoriteMode: null,
      stats: {
        base: {
          mode: 'base',
          totalGames: 0,
          totalPlayers: 0,
          playerStats: {},
        },
        'base-extension': {
          mode: 'base-extension',
          totalGames: 0,
          totalPlayers: 0,
          playerStats: {},
        },
        incremental: {
          mode: 'incremental',
          totalGames: 0,
          totalPlayers: 0,
          playerStats: {},
        },
        rascal: {
          mode: 'rascal',
          totalGames: 0,
          totalPlayers: 0,
          playerStats: {},
        },
      },
      playerStats: {},
    };
  },

  /**
   * Récupérer les stats pour un joueur spécifique
   */
  async getPlayerStats(playerId: string): Promise<PlayerGameStats | null> {
    try {
      const stats = await this.getStats();
      return stats.playerStats[playerId] || null;
    } catch (error) {
      console.warn('Could not get player stats:', error);
      return null;
    }
  },

  /**
   * Récupérer les stats pour un mode de jeu spécifique
   */
  async getModeStats(mode: GameMode): Promise<GameModeStats | null> {
    try {
      const stats = await this.getStats();
      return stats.stats[mode] || null;
    } catch (error) {
      console.warn('Could not get mode stats:', error);
      return null;
    }
  },

  /**
   * Réinitialiser toutes les stats (pour debug/test)
   */
  async resetStats(): Promise<void> {
    try {
      const emptyStats: OverallStats = {
        totalGamesPlayed: 0,
        favoriteMode: null,
        stats: {
          base: {
            mode: 'base',
            totalGames: 0,
            totalPlayers: 0,
            playerStats: {},
          },
          'base-extension': {
            mode: 'base-extension',
            totalGames: 0,
            totalPlayers: 0,
            playerStats: {},
          },
          incremental: {
            mode: 'incremental',
            totalGames: 0,
            totalPlayers: 0,
            playerStats: {},
          },
          rascal: {
            mode: 'rascal',
            totalGames: 0,
            totalPlayers: 0,
            playerStats: {},
          },
        },
        playerStats: {},
      };
      await storageService.setItem(STATS_STORAGE_KEY, JSON.stringify(emptyStats));
    } catch (error) {
      console.warn('Could not reset stats:', error);
    }
  },
};

