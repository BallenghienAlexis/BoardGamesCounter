---
name: add-board-game
description: Guide pas à pas pour ajouter un nouveau jeu de société (ou un nouveau mode de Skull King) à BoardGamesCounter - types, règles de score testées, contexte et stockage, routes, sélection sur l'accueil, statistiques. À utiliser quand on veut supporter un nouveau jeu ou une nouvelle variante.
argument-hint: <nom du jeu ou de la variante>
---

Jeu / variante : $ARGUMENTS

Commence par lancer le skill `/feature` pour le cadre (plan, branche, revue, PR) ; ce guide détaille la partie technique.

## A. Nouveau mode de Skull King

1. `src/types/SkullKing.ts` : ajouter la valeur à `GameMode` (et `RascalVariant`/`ScoringSystem` si besoin).
2. `src/utils/SkullKingRules.ts` : entrée dans `SKULL_KING_GAME_MODES` ; fonction de score **pure** `calculate<Mode>Score(...)`.
3. Tests dans `src/utils/__tests__/SkullKingRules.test.ts` : chaque règle + cas limites. Validation par `skull-king-rules-expert`.
4. Brancher le calcul dans `app/skull-king/[gameId].tsx` (là où le mode choisit la fonction de score).
5. Proposer le mode dans `src/components/GameTypeSelector.tsx` et/ou `app/skull-king/game-setup.tsx`.
6. Statistiques : vérifier `src/utils/StatsService.ts` et `app/(tabs)/stats.tsx` (libellés par mode).
7. Docs : tableau des règles dans `docs/ARCHITECTURE.md`, liste des modes dans le README.

## B. Nouveau jeu indépendant

1. Choisir le modèle :
   - simple compteur de points par joueur → réutiliser `GameContext` / `app/[gameId].tsx` (compteur générique) ;
   - règles propres (manches, mises, bonus) → nouveau dossier calqué sur Skull King.
2. Pour un jeu à règles propres :
   - `src/types/<Jeu>.ts` : config, manche, état de partie ;
   - `src/utils/<Jeu>Rules.ts` + `src/utils/__tests__/<Jeu>Rules.test.ts` : logique pure testée ;
   - `src/contexts/<Jeu>Context.tsx` : état + persistance via `storageService`, **nouveau préfixe de clé** `<jeu>_game_` (ne jamais réutiliser une clé existante) ; l'ajouter au tableau des clés de `docs/ARCHITECTURE.md` ;
   - provider ajouté dans `app/_layout.tsx` ;
   - routes `app/<jeu>/index.tsx`, `game-setup.tsx`, `[gameId].tsx`, `game-end.tsx` et `Stack.Screen` si nécessaire ;
   - entrée sur l'accueil `app/(tabs)/index.tsx` (choix du jeu + parties en cours) ;
   - historique / statistiques : `StatsService` est aujourd'hui typé sur `GameMode` de Skull King ; prévoir son extension sans casser `skull_king_game_stats` (skill `storage-migration`).
3. Réutiliser `Button`, `AlertModal`, `PageHeader`, `PlayerSetupModal`, `useTheme()`.

## Vérifications

`npm run validate`, puis test manuel : créer, quitter, reprendre, terminer une partie ; vérifier que les parties Skull King existantes s'affichent toujours.
