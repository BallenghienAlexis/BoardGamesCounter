---
paths:
  - "**/__tests__/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Tests

- Jest 29 + preset `jest-expo` + React Native Testing Library 13 (config et seuils de couverture dans `package.json`). Lancer : `npm test`, `npm test -- <motif>`, `npm run test:coverage`.
- Emplacement : `src/**/__tests__/*.test.ts(x)` ; écrans dans `__tests__/app/` (même arborescence que `app/`). Jamais dans `app/`.
- Mocks globaux dans `jest.setup.ts` : AsyncStorage (vidé avant chaque test), Expo Router (`mockRouter` de `test-utils/router`, `useFocusEffect` exécuté une fois au montage), safe area, icônes rendues en `<Icon name=…>`.
- Outils `test-utils/` : `renderWithProviders`, `renderWithGame`, `seedStorage`, `flushAsync`, `makeGame`, `makeConfig`.
- Nommer par comportement observable (`it('gives +20 to BOTH players when…')`), valeurs attendues calculées à la main en commentaire si besoin.
- Bugfix : le test échoue d'abord, puis le correctif.
- Bug constaté hors périmètre : `it.failing(...)` précédé d'un commentaire `BUG :`, et signalement.
- Ne jamais `.skip`, supprimer ou assouplir un test pour obtenir du vert ; signaler le comportement suspect.
