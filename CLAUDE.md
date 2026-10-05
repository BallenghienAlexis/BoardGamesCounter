# CLAUDE.md

Contexte pour Claude Code sur ce dépôt. La documentation humaine est dans `README.md` et `docs/`.

## Projet

BoardGamesCounter : compteur de scores de jeux de société (surtout Skull King) en Expo SDK 54 / React Native 0.81 / React 19.1 / TypeScript strict, Expo Router 6. New Architecture et React Compiler activés. 100 % hors-ligne : persistance AsyncStorage via `storageService`. Interface en français, thème sombre unique (`#0F1419`). Distribué en APK Android via EAS.

## Commandes

```bash
npm start            # Expo dev server
npm run lint         # ESLint (doit rester à 0 avertissement)
npm run typecheck    # tsc --noEmit
npm test             # Jest (jest-expo)
npm run validate     # tout ce qui précède + cohérence versions + config EAS
```

## Architecture (détail : docs/ARCHITECTURE.md)

- `app/` : routes Expo Router uniquement. Ne jamais y mettre de tests ni de fichiers non-route.
- `src/utils/` : logique pure. `SkullKingRules.ts` est le cœur métier, couvert par `src/utils/__tests__/SkullKingRules.test.ts`.
- `src/contexts/` : `ThemeContext`, `PlayersContext`, `GameContext` (compteur générique), `SkullKingContext`, `StatsContext`.
- `src/types/` : types persistés (`SkullKingGameState`, `OverallStats`…).
- `components/`, `hooks/`, `constants/`, `app/modal.tsx` : restes du template Expo, non utilisés par l'app.
- Alias `@/` = racine du repo.

## Règles importantes

- **Données utilisateur** : les clés AsyncStorage (`board_games_saved_players`, `board_games_counter_games`, `skull_king_game_<id>`, `skull_king_game_stats`) contiennent des parties réelles. Tout changement de forme doit rester rétro-compatible ou migrer (skill `storage-migration`).
- **Fin de partie** : une partie Skull King est terminée quand `currentRound > config.cardsPerRound.length`.
- **Sauvegarde avant navigation** : utiliser `exitGameCleanly()` pour quitter une partie.
- **Règles de score** : toute modification passe par des tests et l'agent `skull-king-rules-expert`. Butin = +20 pour chacun des deux joueurs si les deux ont réussi leur mise ; l'alliance est stockée chez les deux.
- Couleurs via `useTheme()`, textes UI en français, dépendances ajoutées avec `npx expo install`.

## Workflow (détail : docs/WORKFLOW.md)

- Jamais de commit direct sur `master` ; branche `<type>/<slug>` ; PR + CI verte ; squash merge.
- Commits Conventional Commits (`feat(skull-king): …`, `fix(storage): …`), en anglais comme l'historique.
- Entrée `[Unreleased]` dans `CHANGELOG.md` pour tout `feat`/`fix`/`perf`.
- Release : version identique dans `package.json` et `app.json`, puis tag `vX.Y.Z` (déclenche un build EAS payant en quota : uniquement sur demande explicite).

## Agents et skills

Agents (`.claude/agents/`) : `planner`, `feature-developer`, `test-engineer`, `code-reviewer`, `skull-king-rules-expert`, `mobile-ux-reviewer`, `debugger`, `doc-keeper`, `release-manager`, `dependency-upgrader`.

Skills (`.claude/skills/`) : `/feature`, `/bugfix`, `/review-changes`, `/validate`, `/commit`, `/release`, `/doc-sync`, `add-board-game`, `storage-migration`, `maintenance-audit`.

Références tierces (Expo, React, accessibilité) : `.agents/skills/`.
