---
paths:
  - "app/**"
  - "src/components/**"
---

# Écrans et composants

- `app/` ne contient que des routes Expo Router : pas de tests, pas de composants partagés, pas d'utilitaires.
- Logique non triviale (calculs, tri, agrégation) → `src/utils/` pour être testable.
- Couleurs via `useTheme()` ; textes en français ; polices Poppins déjà chargées dans `app/_layout.tsx`.
- Réutiliser `Button`, `AlertModal`, `PageHeader`, `PlayerSetupModal` avant d'en créer d'autres.
- Safe areas via `react-native-safe-area-context` (pas le `SafeAreaView` de `react-native`).
- React Compiler activé : pas de mutation d'état, pas de lecture de `ref.current` pendant le rendu.
- Dépendances de hooks complètes (lint `react-hooks` à 0 avertissement).
- Confirmation (`AlertModal`) avant toute action destructive.
- Revue UI : agent `mobile-ux-reviewer`. Références : skills `building-native-ui`, `accessibility`.
