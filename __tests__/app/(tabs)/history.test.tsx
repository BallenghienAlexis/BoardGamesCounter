import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import { Line } from 'react-native-svg';
import HistoryScreen from '@/app/(tabs)/history';
import { renderWithProviders, seedStorage } from '@/test-utils/render';
import { makeGame, makeRound } from '@/test-utils/fixtures';

const players = [
  { id: 'player_0', name: 'Alice' },
  { id: 'player_1', name: 'Bob' },
  { id: 'player_2', name: 'Chloé' },
  { id: 'player_3', name: 'David' },
  { id: 'ghost_barbe_grise', name: 'Fantôme de Barbe Grise' },
];

const finished = makeGame({
  gameId: '200',
  players,
  currentRound: 11,
  rounds: [makeRound(1, { player_0: 20, player_1: -10 }), makeRound(2, { player_0: 40, player_2: 30 })],
  playerScores: { player_0: 60, player_1: -10, player_2: 30, player_3: 0 },
});
const ongoing = makeGame({
  gameId: '100',
  mode: 'incremental',
  currentRound: 2,
  rounds: [makeRound(1, { player_0: 1, player_1: -1 })],
  playerScores: { player_0: 1, player_1: -1 },
});
const noRounds = makeGame({ gameId: '50', rounds: [] });

describe('HistoryScreen', () => {
  it('shows an empty state without games', async () => {
    renderWithProviders(<HistoryScreen />);
    expect(await screen.findByText('Aucune partie disponible')).toBeTruthy();
  });

  it('separates ongoing and finished games and selects the most recent one', async () => {
    await seedStorage({ skull_king_game_100: ongoing, skull_king_game_200: finished });
    renderWithProviders(<HistoryScreen />);

    expect(await screen.findByText('📋 Parties en Cours')).toBeTruthy();
    expect(screen.getByText('📊 Manche 2/10')).toBeTruthy();
    expect(screen.getByText('✅ Parties Terminées')).toBeTruthy();
    expect(screen.getByText('⚓ 10 manches')).toBeTruthy();
    // Le fantôme n'est pas compté
    expect(screen.getByText('4 joueur(s)')).toBeTruthy();

    expect(screen.getByText('📈 Évolution des Scores (Partie Terminée)')).toBeTruthy();
    expect(screen.getByText('📊 État Final 🏆')).toBeTruthy();
    // Classement trié par score, fantôme exclu
    expect(screen.getByText('🥇 Alice')).toBeTruthy();
    expect(screen.getByText('🥈 Chloé')).toBeTruthy();
    expect(screen.getByText('🥉 David')).toBeTruthy();
    expect(screen.getByText('🥉 Bob')).toBeTruthy();
    expect(screen.getByText('-10 pts')).toBeTruthy();
    expect(screen.queryByText(/Fantôme/)).toBeNull();
    // Une ligne de courbe par joueur et par intervalle entre manches
    expect(screen.UNSAFE_getAllByType(Line).filter(l => l.props.strokeWidth === '2.5')).toHaveLength(4);
  });

  it('shows the current state of an ongoing game when selected', async () => {
    await seedStorage({ skull_king_game_100: ongoing, skull_king_game_200: finished });
    renderWithProviders(<HistoryScreen />);
    fireEvent.press(await screen.findByText('📊 Manche 2/10'));
    expect(screen.getByText('📊 État Final Actuel')).toBeTruthy();
    expect(screen.getByText('1 pts')).toBeTruthy();
  });

  it('does not draw a chart for a game without rounds', async () => {
    await seedStorage({ skull_king_game_50: noRounds });
    renderWithProviders(<HistoryScreen />);
    expect(await screen.findByText('⚓ Manche 1/10')).toBeTruthy();
    expect(screen.queryByText(/Évolution des Scores/)).toBeNull();
  });

  it('handles a game where every score is zero', async () => {
    await seedStorage({ skull_king_game_50: makeGame({ gameId: '50' }) });
    renderWithProviders(<HistoryScreen />);
    expect(await screen.findByText('📈 Évolution des Scores ')).toBeTruthy();
  });
});
