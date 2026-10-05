---
paths:
  - "src/contexts/**"
  - "src/types/**"
  - "src/utils/StorageService.ts"
  - "src/utils/StatsService.ts"
---

# Données persistées

- Les clés AsyncStorage (`board_games_saved_players`, `board_games_counter_games`, `skull_king_game_<id>`, `skull_king_game_stats`) contiennent les vraies parties des utilisateurs, sans sauvegarde ailleurs.
- Tout accès passe par `storageService` ; jamais `AsyncStorage` en direct.
- Changer la forme d'un type persisté : champ optionnel + valeur par défaut à la lecture, sinon migration versionnée. Suivre le skill `storage-migration`.
- Un nouveau jeu utilise son propre préfixe de clé ; ne jamais réutiliser une clé existante.
- Sauvegarder avant de naviguer hors d'une partie (`exitGameCleanly()`).
- Mettre à jour le tableau « Persistance » de `docs/ARCHITECTURE.md` si une clé change.
