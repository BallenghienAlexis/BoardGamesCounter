import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { SkullKingGameConfig, SkullKingGameState, SkullKingRound } from '../types/SkullKing';
import { storageService } from '../utils/StorageService';

interface SkullKingContextType {
  gameState: SkullKingGameState | null;
  createSkullKingGame: (
    players: { id: string; name: string }[],
    config: SkullKingGameConfig
  ) => void;
  resetGameWithSamePlayers: () => void;
  updatePlayerBet: (roundIndex: number, playerId: string, bet: number) => void;
  updatePlayerTricks: (roundIndex: number, playerId: string, tricks: number) => void;
  updateRoundScore: (roundIndex: number, playerId: string, score: number) => void;
  addBonus: (roundIndex: number, playerId: string, bonusType: string, amount: number) => void;
  nextRound: () => void;
  finishGame: () => void;
  loadGameState: (gameId: string) => Promise<void>;
  saveGameState: () => Promise<void>;
  getUnfinishedGames: () => Promise<SkullKingGameState[]>;
  deleteGame: (gameId: string) => Promise<void>;
  exitGameCleanly: () => Promise<void>;
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
     // Create the first round
     const firstRound: SkullKingRound = {
       roundNumber: 1,
       cardsDistributed: config.cardsPerRound[0],
       playerBets: {},
       playerTricks: {},
       roundScores: {},
       bonuses: players.reduce((acc, p) => ({ ...acc, [p.id]: {} }), {}),
     };
     const newGameState: SkullKingGameState = {
       gameId,
       players,
       config,
       currentRound: 1,
       rounds: [firstRound],
       playerScores: players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {}),
     };
     setGameState(newGameState);
   };

   const resetGameWithSamePlayers = () => {
     if (!gameState) return;
     const gameId = Date.now().toString();
     // Create the first round
     const firstRound: SkullKingRound = {
       roundNumber: 1,
       cardsDistributed: gameState.config.cardsPerRound[0],
       playerBets: {},
       playerTricks: {},
       roundScores: {},
       bonuses: gameState.players.reduce((acc, p) => ({ ...acc, [p.id]: {} }), {}),
     };
     const newGameState: SkullKingGameState = {
       gameId,
       players: gameState.players,
       config: gameState.config,
       currentRound: 1,
       rounds: [firstRound],
       playerScores: gameState.players.reduce((acc, player) => ({ ...acc, [player.id]: 0 }), {}),
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

      // Update total score: add current manche score to previous cumulative total
      // Calculate the previous total (sum of all manches before current one)
      const previousTotalFromRounds = prev.rounds
        .slice(0, roundIndex)
        .reduce((sum, round) => sum + (round.roundScores[playerId] || 0), 0);

      // New total = previous rounds total + current round score
      const newTotalScore = previousTotalFromRounds + score;

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

   const saveGameState = useCallback(async () => {
     if (!gameState) return;
     try {
       await storageService.setItem(STORAGE_KEY_PREFIX + gameState.gameId, JSON.stringify(gameState));
     } catch (error) {
       console.warn('Could not save Skull King game state:', error);
     }
   }, [gameState]);

   const loadGameState = async (gameId: string) => {
     try {
       const stored = await storageService.getItem(STORAGE_KEY_PREFIX + gameId);
       if (stored) {
         setGameState(JSON.parse(stored));
       }
     } catch (error) {
       console.warn('Could not load Skull King game state:', error);
     }
   };

    const getUnfinishedGames = async (): Promise<SkullKingGameState[]> => {
      try {
        const keys = await storageService.getAllKeys();
        const gameKeys = keys.filter(key => key.startsWith(STORAGE_KEY_PREFIX));
        const games: SkullKingGameState[] = [];

        for (const key of gameKeys) {
          const stored = await storageService.getItem(key);
          if (stored) {
            const game = JSON.parse(stored);
            // Only return unfinished games (not all rounds completed)
            // Protect against missing config
            if (game.config?.cardsPerRound && game.currentRound <= game.config.cardsPerRound.length) {
              games.push(game);
            }
          }
        }

        return games.sort((a, b) =>
          parseInt(b.gameId) - parseInt(a.gameId) // Most recent first
        );
      } catch (error) {
        console.warn('Could not load unfinished games:', error);
        return [];
      }
   };

    const deleteGame = async (gameId: string) => {
      try {
        await storageService.removeItem(STORAGE_KEY_PREFIX + gameId);
        if (gameState?.gameId === gameId) {
          setGameState(null);
        }
      } catch (error) {
        console.warn('Could not delete game:', error);
      }
    };

    const exitGameCleanly = async () => {
      try {
        // Force explicit save before exiting
        if (gameState) {
          await storageService.setItem(STORAGE_KEY_PREFIX + gameState.gameId, JSON.stringify(gameState));
        }
      } catch (error) {
        console.warn('Could not save game state on exit:', error);
      }
    };

   // Auto-save game state when it changes
  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

    return (
      <SkullKingContext.Provider
        value={{
          gameState,
          createSkullKingGame,
          resetGameWithSamePlayers,
          updatePlayerBet,
          updatePlayerTricks,
          updateRoundScore,
          addBonus,
          nextRound,
          finishGame,
          loadGameState,
          saveGameState,
          getUnfinishedGames,
          deleteGame,
          exitGameCleanly,
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
