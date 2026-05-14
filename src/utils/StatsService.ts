import { storageService } from './StorageService';
import type { PlayerGameResult, OverallStats, GameModeStats, PlayerGameStats } from '../types/Stats';
import type { GameMode } from '../types/SkullKing';

const STATS_STORAGE_KEY = 'skull_king_game_stats';

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
        return JSON.parse(stored);
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

