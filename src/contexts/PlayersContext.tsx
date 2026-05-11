import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlayersContextType {
  savedPlayers: string[];
  addPlayer: (name: string) => Promise<void>;
  removePlayer: (name: string) => Promise<void>;
  loadPlayers: () => Promise<void>;
}

const PlayersContext = createContext<PlayersContextType | undefined>(undefined);

const STORAGE_KEY = 'board_games_saved_players';

const DEFAULT_PLAYERS = ['Alban', 'Alexandre', 'Alexis', 'Anatole', 'Aurélien', 'Benjamin', 'Quentin', 'Timéo'];

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [savedPlayers, setSavedPlayers] = useState<string[]>(DEFAULT_PLAYERS);

  const loadPlayers = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedPlayers(JSON.parse(stored));
      } else {
        // Initialize with default players
        setSavedPlayers(DEFAULT_PLAYERS);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS));
      }
    } catch (error) {
      console.error('Failed to load players:', error);
      setSavedPlayers(DEFAULT_PLAYERS);
    }
  };

  const addPlayer = async (name: string) => {
    try {
      const trimmedName = name.trim();
      if (!trimmedName || savedPlayers.includes(trimmedName)) return;

      const updated = [...savedPlayers, trimmedName];
      setSavedPlayers(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to add player:', error);
    }
  };

  const removePlayer = async (name: string) => {
    try {
      const updated = savedPlayers.filter(p => p !== name);
      setSavedPlayers(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to remove player:', error);
    }
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <PlayersContext.Provider
      value={{
        savedPlayers,
        addPlayer,
        removePlayer,
        loadPlayers,
      }}
    >
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used within PlayersProvider');
  }
  return context;
}

