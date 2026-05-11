import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { storageService } from '../utils/StorageService';

export interface Player {
  id: string;
  name: string;
  score: number;
  history: number[];
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  createdAt: string;
  rounds: number;
}

interface GameContextType {
  games: Game[];
  createGame: (name: string, playerNames: string[]) => void;
  deleteGame: (gameId: string) => void;
  updatePlayerScore: (gameId: string, playerId: string, points: number) => void;
  undoLastMove: (gameId: string, playerId: string) => void;
  resetGame: (gameId: string) => void;
  currentGame: Game | null;
  setCurrentGame: (game: Game | null) => void;
  addRound: (gameId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const STORAGE_KEY = 'board_games_counter_games';

export function GameProvider({ children }: { children: ReactNode }) {
  const [games, setGames] = useState<Game[]>([]);
  const [currentGame, setCurrentGame] = useState<Game | null>(null);

  // Load games from AsyncStorage on mount
  useEffect(() => {
    loadGames();
  }, []);

    // Save games to storage whenever they change
    useEffect(() => {
      const saveGames = async () => {
        try {
          await storageService.setItem(STORAGE_KEY, JSON.stringify(games));
        } catch (error) {
          console.warn('Could not save games to storage:', error);
        }
      };
      saveGames();
    }, [games]);

    const loadGames = async () => {
      try {
        const stored = await storageService.getItem(STORAGE_KEY);
        if (stored) {
          setGames(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('Could not load games from storage:', error);
        setGames([]);
      }
    };

   const createGame = (name: string, playerNames: string[]) => {
    const newGame: Game = {
      id: Date.now().toString(),
      name,
      players: playerNames.map((name, index) => ({
        id: `player_${index}`,
        name,
        score: 0,
        history: [],
      })),
      createdAt: new Date().toISOString(),
      rounds: 1,
    };
    setGames([...games, newGame]);
    setCurrentGame(newGame);
  };

  const deleteGame = (gameId: string) => {
    setGames(games.filter(g => g.id !== gameId));
    if (currentGame?.id === gameId) {
      setCurrentGame(null);
    }
  };

  const updatePlayerScore = (gameId: string, playerId: string, points: number) => {
    setGames(
      games.map(game => {
        if (game.id === gameId) {
          const updatedGame = {
            ...game,
            players: game.players.map(player => {
              if (player.id === playerId) {
                return {
                  ...player,
                  score: player.score + points,
                  history: [...player.history, player.score + points],
                };
              }
              return player;
            }),
          };
          // Update current game if it's the one being modified
          if (currentGame?.id === gameId) {
            setCurrentGame(updatedGame);
          }
          return updatedGame;
        }
        return game;
      })
    );
  };

  const undoLastMove = (gameId: string, playerId: string) => {
    setGames(
      games.map(game => {
        if (game.id === gameId) {
          const updatedGame = {
            ...game,
            players: game.players.map(player => {
              if (player.id === playerId && player.history.length > 0) {
                const newHistory = [...player.history];
                newHistory.pop();
                return {
                  ...player,
                  score: newHistory.length > 0 ? newHistory[newHistory.length - 1] : 0,
                  history: newHistory,
                };
              }
              return player;
            }),
          };
          if (currentGame?.id === gameId) {
            setCurrentGame(updatedGame);
          }
          return updatedGame;
        }
        return game;
      })
    );
  };

  const resetGame = (gameId: string) => {
    setGames(
      games.map(game => {
        if (game.id === gameId) {
          const updatedGame = {
            ...game,
            players: game.players.map(player => ({
              ...player,
              score: 0,
              history: [],
            })),
            rounds: 1,
          };
          if (currentGame?.id === gameId) {
            setCurrentGame(updatedGame);
          }
          return updatedGame;
        }
        return game;
      })
    );
  };

  const addRound = (gameId: string) => {
    setGames(
      games.map(game => {
        if (game.id === gameId) {
          const updatedGame = {
            ...game,
            rounds: game.rounds + 1,
          };
          if (currentGame?.id === gameId) {
            setCurrentGame(updatedGame);
          }
          return updatedGame;
        }
        return game;
      })
    );
  };

  return (
    <GameContext.Provider
      value={{
        games,
        createGame,
        deleteGame,
        updatePlayerScore,
        undoLastMove,
        resetGame,
        currentGame,
        setCurrentGame,
        addRound,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGames must be used within GameProvider');
  }
  return context;
}

