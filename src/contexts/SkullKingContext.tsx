import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SkullKingGameConfig, SkullKingGameState, SkullKingRound } from '../types/SkullKing';

interface SkullKingContextType {
  gameState: SkullKingGameState | null;
  createSkullKingGame: (
    players: { id: string; name: string }[],
    config: SkullKingGameConfig
  ) => void;
  updatePlayerBet: (roundIndex: number, playerId: string, bet: number) => void;
  updatePlayerTricks: (roundIndex: number, playerId: string, tricks: number) => void;
  updateRoundScore: (roundIndex: number, playerId: string, score: number) => void;
  addBonus: (roundIndex: number, playerId: string, bonusType: string, amount: number) => void;
  nextRound: () => void;
  finishGame: () => void;
  loadGameState: (gameId: string) => Promise<void>;
  saveGameState: () => Promise<void>;
}

const SkullKingContext = createContext<SkullKingContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'skull_king_game_';

export function SkullKingProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<SkullKingGameState | null>(null);

  const createSkullKingGame = (
    players: { id: string; name: string }[],
    config: SkullKingGameConfig
  ) => {
    const gameId = Date.now().toString();
    const newGameState: SkullKingGameState = {
      gameId,
      players,
      config,
      currentRound: 1,
      rounds: [],
      playerScores: players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {}),
    };
    setGameState(newGameState);
  };

  const updatePlayerBet = (roundIndex: number, playerId: string, bet: number) => {
    if (!gameState || !gameState.rounds[roundIndex]) return;

    setGameState(prev => {
      if (!prev || !prev.rounds[roundIndex]) return prev;
      const updatedRounds = [...prev.rounds];
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        playerBets: { ...updatedRounds[roundIndex].playerBets, [playerId]: bet },
      };
      return { ...prev, rounds: updatedRounds };
    });
  };

  const updatePlayerTricks = (roundIndex: number, playerId: string, tricks: number) => {
    if (!gameState || !gameState.rounds[roundIndex]) return;

    setGameState(prev => {
      if (!prev || !prev.rounds[roundIndex]) return prev;
      const updatedRounds = [...prev.rounds];
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        playerTricks: { ...updatedRounds[roundIndex].playerTricks, [playerId]: tricks },
      };
      return { ...prev, rounds: updatedRounds };
    });
  };

  const updateRoundScore = (roundIndex: number, playerId: string, score: number) => {
    if (!gameState || !gameState.rounds[roundIndex]) return;

    setGameState(prev => {
      if (!prev || !prev.rounds[roundIndex]) return prev;
      const updatedRounds = [...prev.rounds];
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        roundScores: { ...updatedRounds[roundIndex].roundScores, [playerId]: score },
      };

      // Update total score
      const newTotalScore = prev.rounds
        .slice(0, roundIndex + 1)
        .reduce((sum, round) => sum + (round.roundScores[playerId] || 0), 0);

      return {
        ...prev,
        rounds: updatedRounds,
        playerScores: { ...prev.playerScores, [playerId]: newTotalScore },
      };
    });
  };

  const addBonus = (roundIndex: number, playerId: string, bonusType: string, amount: number) => {
    if (!gameState || !gameState.rounds[roundIndex]) return;

    setGameState(prev => {
      if (!prev || !prev.rounds[roundIndex]) return prev;
      const updatedRounds = [...prev.rounds];
      const bonuses = { ...updatedRounds[roundIndex].bonuses[playerId] };
      (bonuses as any)[bonusType] = amount;
      updatedRounds[roundIndex] = {
        ...updatedRounds[roundIndex],
        bonuses: { ...updatedRounds[roundIndex].bonuses, [playerId]: bonuses },
      };
      return { ...prev, rounds: updatedRounds };
    });
  };

  const nextRound = () => {
    setGameState(prev => {
      if (!prev || prev.currentRound >= prev.config.cardsPerRound.length) return prev;

      const nextRoundNumber = prev.currentRound + 1;
      const newRound: SkullKingRound = {
        roundNumber: nextRoundNumber,
        cardsDistributed: prev.config.cardsPerRound[nextRoundNumber - 1],
        playerBets: {},
        playerTricks: {},
        roundScores: {},
        bonuses: prev.players.reduce((acc, p) => ({ ...acc, [p.id]: {} }), {}),
      };

      return {
        ...prev,
        currentRound: nextRoundNumber,
        rounds: [...prev.rounds, newRound],
      };
    });
  };

  const finishGame = () => {
    // Game is complete - scores are final
    setGameState(prev => (prev ? { ...prev, currentRound: prev.config.cardsPerRound.length + 1 } : null));
  };

  const saveGameState = async () => {
    if (!gameState) return;
    try {
      await AsyncStorage.setItem(STORAGE_KEY_PREFIX + gameState.gameId, JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save Skull King game state:', error);
    }
  };

  const loadGameState = async (gameId: string) => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY_PREFIX + gameId);
      if (stored) {
        setGameState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load Skull King game state:', error);
    }
  };

  // Auto-save game state when it changes
  useEffect(() => {
    if (gameState) {
      saveGameState();
    }
  }, [gameState]);

  return (
    <SkullKingContext.Provider
      value={{
        gameState,
        createSkullKingGame,
        updatePlayerBet,
        updatePlayerTricks,
        updateRoundScore,
        addBonus,
        nextRound,
        finishGame,
        loadGameState,
        saveGameState,
      }}
    >
      {children}
    </SkullKingContext.Provider>
  );
}

export function useSkullKingGame() {
  const context = useContext(SkullKingContext);
  if (!context) {
    throw new Error('useSkullKingGame must be used within SkullKingProvider');
  }
  return context;
}

