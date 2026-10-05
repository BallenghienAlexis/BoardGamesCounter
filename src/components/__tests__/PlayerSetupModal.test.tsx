import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { PlayerSetupModal } from '../PlayerSetupModal';
import { renderWithProviders } from '@/test-utils/render';

const SAVED = ['Alice', 'Bob', 'Chloé'];

async function renderModal() {
  await AsyncStorage.setItem('board_games_saved_players', JSON.stringify(SAVED));
  const onPlayersSelected = jest.fn();
  const onCancel = jest.fn();
  renderWithProviders(<PlayerSetupModal onPlayersSelected={onPlayersSelected} onCancel={onCancel} />);
  await screen.findByText('Chloé');
  return { onPlayersSelected, onCancel };
}

const search = (text: string) =>
  fireEvent.changeText(screen.getByPlaceholderText('Chercher ou ajouter un joueur...'), text);

describe('PlayerSetupModal', () => {
  it('lists saved players and asks for at least two', async () => {
    await renderModal();
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Sélectionnez au moins 2 joueurs pour commencer')).toBeTruthy();
  });

  it('filters suggestions case-insensitively', async () => {
    await renderModal();
    search('CHL');
    expect(screen.getByText('Chloé')).toBeTruthy();
    expect(screen.queryByText('Alice')).toBeNull();
    // Le nom n'existe pas exactement : on propose aussi de l'ajouter
    expect(screen.getByText('Ajouter "CHL"')).toBeTruthy();
  });

  it('selects players, hides them from suggestions and starts with positional ids', async () => {
    const { onPlayersSelected } = await renderModal();
    fireEvent.press(screen.getByText('Commencer la Partie'));
    expect(onPlayersSelected).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText('Bob'));
    fireEvent.press(screen.getByText('Alice'));
    expect(screen.getByText('Joueurs sélectionnés (2)')).toBeTruthy();
    expect(screen.queryByText('Sélectionnez au moins 2 joueurs pour commencer')).toBeNull();

    fireEvent.press(screen.getByText('Commencer la Partie'));
    expect(onPlayersSelected).toHaveBeenCalledWith([
      { id: 'player_0', name: 'Bob' },
      { id: 'player_1', name: 'Alice' },
    ]);
  });

  it('removes a selected player', async () => {
    await renderModal();
    fireEvent.press(screen.getByText('Bob'));
    fireEvent.press(screen.UNSAFE_getByProps({ name: 'close-circle' }));
    expect(screen.queryByText('Joueurs sélectionnés (1)')).toBeNull();
    expect(screen.getByText('Bob')).toBeTruthy();
  });

  it('adds and selects a new player, saving it for later', async () => {
    await renderModal();
    search('  Zoé ');
    fireEvent.press(screen.getByText('Ajouter "Zoé"'));
    expect(await screen.findByText('Joueurs sélectionnés (1)')).toBeTruthy();
    await waitFor(async () =>
      expect(JSON.parse((await AsyncStorage.getItem('board_games_saved_players'))!)).toContain('Zoé')
    );
  });

  it('does not offer to add an existing or empty name', async () => {
    await renderModal();
    search('Alice');
    expect(screen.queryByText('Ajouter "Alice"')).toBeNull();
    search('   ');
    expect(screen.queryByText(/Ajouter "/)).toBeNull();
  });

  it('cancels from the footer or the close icon', async () => {
    const { onCancel } = await renderModal();
    fireEvent.press(screen.getByText('Annuler'));
    fireEvent.press(screen.UNSAFE_getByProps({ name: 'close' }));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
