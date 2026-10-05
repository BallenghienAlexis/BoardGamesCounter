---
paths:
  - "**/__tests__/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
---

# Tests

- Jest 29 + preset `jest-expo` (config dans `package.json`). Lancer : `npm test`, `npm test -- <motif>`.
- Emplacement : `src/**/__tests__/*.test.ts(x)`. Jamais dans `app/`.
- Nommer par comportement observable (`it('gives +20 to BOTH players when…')`), valeurs attendues calculées à la main en commentaire si besoin.
- Bugfix : le test échoue d'abord, puis le correctif.
- AsyncStorage : `jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'))`.
- Ne jamais `.skip`, supprimer ou assouplir un test pour obtenir du vert ; signaler le comportement suspect.
