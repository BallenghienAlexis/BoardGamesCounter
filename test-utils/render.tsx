// Rendu d'un écran ou composant avec tous les providers de l'app.
import React, { ReactElement, ReactNode, useEffect, useState } from 'react';
import { act, render, RenderOptions } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { PlayersProvider } from '@/src/contexts/PlayersContext';
import { GameProvider } from '@/src/contexts/GameContext';
import { SkullKingProvider, useSkullKingGame } from '@/src/contexts/SkullKingContext';
import { StatsProvider } from '@/src/contexts/StatsContext';
import type { SkullKingGameState } from '@/src/types/SkullKing';

export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <PlayersProvider>
        <GameProvider>
          <SkullKingProvider>
            <StatsProvider>{children}</StatsProvider>
          </SkullKingProvider>
        </GameProvider>
      </PlayersProvider>
    </ThemeProvider>
  );
}

/** Charge une partie Skull King dans le contexte avant d'afficher les enfants. */
function LoadGame({ gameId, children }: { gameId: string; children: ReactNode }) {
  const { loadGameState, gameState } = useSkullKingGame();
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    loadGameState(gameId).then(() => setRequested(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return requested && gameState ? <>{children}</> : null;
}

interface Options extends Omit<RenderOptions, 'wrapper'> {
  /** Partie Skull King stockée puis chargée dans le contexte avant le rendu. */
  activeGame?: SkullKingGameState;
}

export async function seedStorage(entries: Record<string, unknown>) {
  await AsyncStorage.multiSet(Object.entries(entries).map(([k, v]) => [k, JSON.stringify(v)]));
}

export function renderWithProviders(ui: ReactElement, { activeGame, ...options }: Options = {}) {
  const content = activeGame ? <LoadGame gameId={activeGame.gameId}>{ui}</LoadGame> : ui;
  return render(<AllProviders>{content}</AllProviders>, options);
}

export async function renderWithGame(ui: ReactElement, game: SkullKingGameState, options: RenderOptions = {}) {
  await seedStorage({ [`skull_king_game_${game.gameId}`]: game });
  const result = renderWithProviders(ui, { ...options, activeGame: game });
  await flushAsync();
  return result;
}

/** Laisse se terminer les chargements asynchrones (stockage) déclenchés au montage. */
export const flushAsync = () =>
  act(async () => {
    // Plusieurs tours : certaines chaînes (enregistrement des stats puis rechargement) enchaînent les accès
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  });
