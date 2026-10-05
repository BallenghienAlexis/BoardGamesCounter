import React from 'react';
import { fireEvent, screen } from '@testing-library/react-native';
import GameSetupScreen from '@/app/skull-king/game-setup';
import { flushAsync, renderWithGame, renderWithProviders } from '@/test-utils/render';
import { mockRouter } from '@/test-utils/router';
import { makeConfig, makeGame } from '@/test-utils/fixtures';

describe('GameSetupScreen', () => {
  it('goes back home when there is no active game', async () => {
    renderWithProviders(<GameSetupScreen />);
    await flushAsync();
    expect(mockRouter.replace).toHaveBeenCalledWith('/');
  });

  it('summarises a base game and starts it', async () => {
    await renderWithGame(<GameSetupScreen />, makeGame({ gameId: '7' }));
    expect(await screen.findByText('Joueurs (3)')).toBeTruthy();
    expect(screen.getAllByText('Jeu de Base').length).toBeGreaterThan(0);
    expect(screen.getByText('Système skull-king')).toBeTruthy();
    expect(screen.getByText('Chloé')).toBeTruthy();
    expect(screen.getByText(/10 manches/)).toBeTruthy();
    expect(screen.queryByText('🐙 Kraken Activé')).toBeNull();

    fireEvent.press(screen.getByText('Commencer la Partie'));
    expect(mockRouter.push).toHaveBeenCalledWith({ pathname: '/skull-king/[gameId]', params: { gameId: '7' } });
    fireEvent.press(screen.getByText('Retour'));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('shows the extension rules', async () => {
    const config = makeConfig({ mode: 'base-extension', includeKraken: true, includeWhaleWhite: true, include7And8: true });
    await renderWithGame(<GameSetupScreen />, makeGame({ config }));
    expect(await screen.findByText('🐙 Kraken Activé')).toBeTruthy();
    expect(screen.getByText('🐋 Baleine Blanche Activée')).toBeTruthy();
    expect(screen.getByText('🎁 Bonus Supplémentaires (Extension)')).toBeTruthy();
    expect(screen.getByText('7️⃣ Cartes 7 et 8')).toBeTruthy();
    expect(screen.getByText('👻 Le Second')).toBeTruthy();
    expect(screen.getByText('☠️ Casier de Davy Jones')).toBeTruthy();
  });

  it('shows the simplified scoring of the incremental mode', async () => {
    await renderWithGame(<GameSetupScreen />, makeGame({ config: makeConfig({ mode: 'incremental' }) }));
    expect(await screen.findByText('Scoring simplifié')).toBeTruthy();
    expect(screen.getByText('Scoring simplifié: +1 pour une mise exacte, -1 pour un écart')).toBeTruthy();
  });

  it('shows the Rascal rules and the two-player ghost', async () => {
    const config = makeConfig({ mode: 'rascal', scoringSystem: 'rascal', twoPlayerVariant: true });
    await renderWithGame(<GameSetupScreen />, makeGame({ config }));
    expect(await screen.findByText('🎲 Mode Rascal - Système Équilibré')).toBeTruthy();
    expect(screen.getByText('🎯 Niveaux de Précision')).toBeTruthy();
    expect(screen.getByText('👻 Fantôme de Barbe Grise (2 joueurs)')).toBeTruthy();
    // Pas de libellé dédié : le mode brut est affiché
    expect(screen.getByText('rascal')).toBeTruthy();
  });

  // BUG : « rascal » manque dans gameModeNames, la carte de règles affiche « Mode: » sans nom.
  it.failing('names the Rascal mode in the rules card', async () => {
    const config = makeConfig({ mode: 'rascal', scoringSystem: 'rascal' });
    await renderWithGame(<GameSetupScreen />, makeGame({ config }));
    expect(await screen.findByText('📋 Mode: Mode Rascal')).toBeTruthy();
  });

  // BUG : la progression affiche la dernière valeur de cardsPerRound, soit « 1 à 1 cartes »
  // pour les modes qui redescendent (extension, incrémental, Rascal).
  it.failing('shows the maximum number of cards for a rising then falling game', async () => {
    const config = makeConfig({ mode: 'incremental', cardsPerRound: [1, 2, 3, 4, 5, 4, 3, 2, 1] });
    await renderWithGame(<GameSetupScreen />, makeGame({ config }));
    expect(await screen.findByText(/1 à 5 cartes par manche/)).toBeTruthy();
  });
});
