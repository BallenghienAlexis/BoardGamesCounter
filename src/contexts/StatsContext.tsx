import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { statsService } from '../utils/StatsService';
import type { OverallStats, GameModeStats, PlayerGameStats, PlayerGameResult } from '../types/Stats';
import type { GameMode } from '../types/SkullKing';

interface StatsContextType {
  stats: OverallStats | null;
  loading: boolean;
  recordGameResult: (gameId: string, gameMode: GameMode, playerResults: PlayerGameResult[]) => Promise<void>;
  loadStats: () => Promise<void>;
  getPlayerStats: (playerId: string) => PlayerGameStats | null;
  getModeStats: (mode: GameMode) => GameModeStats | null;
  resetStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const allStats = await statsService.getStats();
      setStats(allStats);
    } catch (error) {
      console.warn('Could not load stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const recordGameResult = useCallback(
    async (gameId: string, gameMode: GameMode, playerResults: PlayerGameResult[]) => {
      try {
        await statsService.recordGameResult(gameId, gameMode, playerResults);
        // Reload stats after recording
        await loadStats();
      } catch (error) {
        console.warn('Could not record game result:', error);
      }
    },
    [loadStats]
  );

  const getPlayerStats = useCallback((playerId: string): PlayerGameStats | null => {
    if (!stats) return null;
    return stats.playerStats[playerId] || null;
  }, [stats]);

  const getModeStats = useCallback((mode: GameMode): GameModeStats | null => {
    if (!stats) return null;
    return stats.stats[mode] || null;
  }, [stats]);

  const resetStats = useCallback(async () => {
    try {
      await statsService.resetStats();
      await loadStats();
    } catch (error) {
      console.warn('Could not reset stats:', error);
    }
  }, [loadStats]);

  return (
    <StatsContext.Provider
      value={{
        stats,
        loading,
        recordGameResult,
        loadStats,
        getPlayerStats,
        getModeStats,
        resetStats,
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within StatsProvider');
  }
  return context;
}

