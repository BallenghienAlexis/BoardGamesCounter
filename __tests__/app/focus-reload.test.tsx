// Vérifie le rechargement au focus avec le comportement réel de useFocusEffect :
// l'effet est relancé chaque fois que l'identité du callback change.
import React from 'react';
import StatsScreen from '@/app/(tabs)/stats';
import SkullKingHomeScreen from '@/app/skull-king/index';
import { statsService } from '@/src/utils/StatsService';
import { storageService } from '@/src/utils/StorageService';
import { flushAsync, renderWithProviders } from '@/test-utils/render';

jest.mock('expo-router', () => {
  const React = jest.requireActual('react');
  const { mockRouter } = jest.requireActual('../../test-utils/router');
  return {
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (effect: () => void) => React.useEffect(() => effect(), [effect]),
  };
});

afterEach(() => jest.restoreAllMocks());

/** Laisse passer 20 appels puis renvoie une promesse en attente pour arrêter une éventuelle boucle. */
function capCalls(spy: jest.SpyInstance, original: (...args: never[]) => Promise<unknown>) {
  spy.mockImplementation((...args: never[]) => (spy.mock.calls.length > 20 ? new Promise(() => {}) : original(...args)));
  return spy;
}

// Régression : sans useCallback, chaque chargement provoquait un rendu qui relançait le
// chargement (boucle infinie de lectures du stockage tant que l'onglet était affiché).
it('loads the statistics a bounded number of times', async () => {
  const original = statsService.getStats.bind(statsService);
  const getStats = capCalls(jest.spyOn(statsService, 'getStats'), original);
  renderWithProviders(<StatsScreen />);
  await flushAsync();
  expect(getStats.mock.calls.length).toBeLessThan(5);
});

// Régression : même cause sur l'écran Skull King.
it('loads the Skull King games a bounded number of times', async () => {
  const original = storageService.getAllKeys.bind(storageService);
  const getAllKeys = capCalls(jest.spyOn(storageService, 'getAllKeys'), original);
  renderWithProviders(<SkullKingHomeScreen />);
  await flushAsync();
  expect(getAllKeys.mock.calls.length).toBeLessThan(5);
});
