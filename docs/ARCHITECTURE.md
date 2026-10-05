# Architecture

Application Expo (SDK 54) / React Native 0.81 / TypeScript strict, routée par **Expo Router** (routes = fichiers dans `app/`). Aucune API distante : toutes les données vivent sur l'appareil via AsyncStorage.

## Arborescence

```
app/                         # Routes Expo Router (1 fichier = 1 écran)
├── _layout.tsx              # Racine : polices, splash, providers, Stack
├── (tabs)/                  # Barre d'onglets
│   ├── _layout.tsx          # Onglets Jeux / Historique / Statistiques
│   ├── index.tsx            # Accueil : choix du jeu, parties en cours
│   ├── history.tsx          # Historique + graphiques SVG d'évolution
│   └── stats.tsx            # Statistiques globales et par variante
├── skull-king/
│   ├── index.tsx            # Liste des parties Skull King
│   ├── game-setup.tsx       # Configuration (mode, joueurs, variantes)
│   ├── [gameId].tsx         # Écran de partie (mises, plis, bonus)
│   └── game-end.tsx         # Résumé final + graphique de la partie
├── [gameId].tsx             # Compteur générique (GameContext)
└── modal.tsx                # Reste du template Expo (non utilisé)
src/
├── components/              # Composants UI de l'app (Button, AlertModal, ScoreInput…)
├── contexts/                # État global (React Context)
├── types/                   # Types métier (SkullKing.ts, Stats.ts)
└── utils/                   # Logique pure + services
    ├── SkullKingRules.ts    # ⚠️ Calcul des scores : cœur métier, testé
    ├── StatsService.ts      # Agrégation des statistiques
    ├── StorageService.ts    # Wrapper AsyncStorage avec repli mémoire
    └── __tests__/           # Tests unitaires Jest (aussi dans contexts/ et components/)
components/, hooks/, constants/  # Reste du template Expo (themed-*, haptic-tab…)
__tests__/app/               # Tests des écrans (même arborescence que app/)
test-utils/                  # Outils de test : providers, fixtures, router factice
jest.setup.ts                # Mocks globaux Jest (AsyncStorage, Expo Router, icônes…)
docs/                        # Architecture, workflow, déploiement, maintenance, plans
└── rules/skull-king/        # Livret officiel Skull King (base + extension), MD + PDF
scripts/validate-build.js    # Validation avant build (tsc, lint, tests, versions)
.github/workflows/           # CI (PR) + build APK (tags v*)
.claude/                     # Configuration Claude Code (voir docs/WORKFLOW.md)
├── agents/                  # Sous-agents spécialisés
├── skills/                  # Skills projet + skills de référence tiers (skills-lock.json)
├── rules/                   # Consignes chargées selon les fichiers touchés
├── hooks/                   # Scripts de hooks
└── settings.json            # Permissions et hooks partagés
CLAUDE.md                    # Contexte chargé à chaque session Claude Code
```

Alias d'import : `@/` pointe vers la racine du repo (`@/src/components/Button`).

## Providers (ordre d'imbrication dans `app/_layout.tsx`)

`SafeAreaProvider → ThemeProvider → PlayersProvider → GameProvider → SkullKingProvider → StatsProvider`

| Contexte | Hook | Rôle |
|---|---|---|
| `ThemeContext` | `useTheme()` | Palette de couleurs (thème sombre unique) |
| `PlayersContext` | `usePlayers()` | Noms de joueurs mémorisés |
| `GameContext` | `useGames()` | Parties du compteur générique |
| `SkullKingContext` | `useSkullKingGame()` | Partie Skull King courante, sauvegarde, reprise, fin de partie |
| `StatsContext` | `useStats()` | Résultats de parties et statistiques |

## Persistance (AsyncStorage)

Tous les accès passent par `storageService` (`src/utils/StorageService.ts`), qui bascule sur un stockage mémoire si AsyncStorage échoue.

| Clé | Contenu | Défini dans |
|---|---|---|
| `board_games_saved_players` | `string[]` noms de joueurs | `PlayersContext.tsx` |
| `board_games_counter_games` | `Game[]` compteur générique | `GameContext.tsx` |
| `skull_king_game_<gameId>` | `SkullKingGameState` (une clé par partie) | `SkullKingContext.tsx` |
| `skull_king_game_stats` | `OverallStats` (joueurs indexés par nom ; `recordedGameIds` évite de compter deux fois une partie) | `StatsService.ts` |

**Les données des utilisateurs ne sont jamais migrées automatiquement.** Toute modification de forme d'un de ces objets doit rester compatible avec les données déjà enregistrées (champs optionnels, valeurs par défaut à la lecture) ou s'accompagner d'une migration. Voir le skill `storage-migration`.

## Modèle Skull King

- `SkullKingGameState` : `players`, `config`, `currentRound`, `rounds[]`, `playerScores`.
- Une partie est **terminée** quand `currentRound > config.cardsPerRound.length` (`finishGame()` pose `currentRound = cardsPerRound.length + 1`). `getUnfinishedGames()` s'appuie sur cette règle.
- Modes (`GameMode`) : `base`, `base-extension`, `incremental`, `rascal` (variantes `chevrotine` / `boulet-de-canon`).
- 10 manches, de 1 à 10 cartes (`SKULL_KING_ROUNDS`, `DEFAULT_CARDS_PER_ROUND`).

## Règles de calcul (source : `src/utils/SkullKingRules.ts`)

| Situation | Points |
|---|---|
| Mise ≥ 1 exacte | +20 × plis |
| Mise ≥ 1 ratée | −10 × écart |
| Mise 0 réussie | +10 × cartes distribuées |
| Mise 0 ratée | −10 × cartes distribuées |
| 14 de couleur / 14 noir | +10 / +20 |
| Sirène capturée par un pirate | +20 |
| Pirate capturé par le Skull King | +30 |
| Skull King capturé par une sirène | +40 |
| Extension : Second capturé / Léviathan / 8 / 7 | +30 / +20 / +5 / −5 |
| Butin (alliance) | +20 pour **chacun** des deux joueurs, si **les deux** ont réussi leur mise |

Les bonus (hors butin) s'appliquent même si la mise est ratée : choix de table confirmé le 2026-10-05 (voir `docs/MAINTENANCE.md`).

- **Incrémental** : +1 si mise exacte, −1 sinon.
- **Rascal chevrotine** : 10 × cartes si exact, moitié si écart de 1, 0 au-delà ; bonus pleins / moitié / nuls selon le même écart.
- **Rascal boulet de canon** : 15 × cartes si exact, 0 sinon ; bonus seulement si exact.

Règles officielles (livret de base et extension) : [`docs/rules/skull-king/`](./rules/skull-king/).

Toute modification de ces règles doit être couverte par `src/utils/__tests__/SkullKingRules.test.ts` et relue par l'agent `skull-king-rules-expert`.
