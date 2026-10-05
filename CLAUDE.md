# BoardGamesCounter

Compteur de scores de jeux de société (surtout Skull King). Expo SDK 54, React Native 0.81, React 19.1, TypeScript strict, Expo Router 6, New Architecture et React Compiler activés. 100 % hors-ligne (AsyncStorage). Interface en français, thème sombre unique. Distribué en APK Android via EAS.

## Commandes

```bash
npm start            # serveur Expo
npm run lint         # ESLint, doit rester à 0 avertissement
npm run typecheck    # tsc --noEmit
npm test             # Jest (jest-expo)
npm run validate     # tout ce qui précède + versions + config EAS
```

## Carte du code

- `app/` : routes Expo Router uniquement.
- `src/utils/` : logique pure et testée (`SkullKingRules.ts` = cœur métier) ; tests dans `src/utils/__tests__/`.
- `src/contexts/` : état global et persistance ; `src/types/` : types persistés ; `src/components/` : UI réutilisable.
- `components/`, `hooks/`, `constants/`, `app/modal.tsx` : restes du template Expo, non utilisés.
- Alias `@/` = racine du repo.
- `docs/rules/skull-king/` : livret officiel des règles (base + extension), référence pour tout calcul de score.
- Détails : `docs/ARCHITECTURE.md`. Des règles par zone se chargent automatiquement depuis `.claude/rules/` (scores, stockage, UI, tests, config/release).

## Toujours

- Ne jamais casser les données déjà enregistrées sur les téléphones (voir `.claude/rules/storage.md`).
- Branche `<type>/<slug>`, jamais de commit direct sur `master` ; PR avec CI verte ; squash merge.
- Commits Conventional Commits en anglais (`feat(skull-king): …`, `fix(storage): …`).
- Entrée sous `[Unreleased]` dans `CHANGELOG.md` pour tout `feat`/`fix`/`perf`.
- Pas de tag `v*` (build EAS facturé au quota) sans demande explicite.
- Lancer `npm run lint && npm run typecheck && npm test` avant de dire qu'un changement est prêt.

## Workflow, agents et skills

Processus complet de la demande au déploiement : `docs/WORKFLOW.md`.

- Point d'entrée : `/feature <description>` ou `/bugfix <description>`.
- Agents (`.claude/agents/`) : `planner`, `feature-developer`, `test-engineer`, `code-reviewer`, `skull-king-rules-expert`, `mobile-ux-reviewer`, `debugger`, `doc-keeper`, `release-manager`, `dependency-upgrader`.
- Skills projet : `/feature`, `/bugfix`, `/review-changes`, `/validate`, `/commit`, `/release`, `/doc-sync`, `add-board-game`, `storage-migration`, `maintenance-audit`.
- Skills de référence tiers (`skills-lock.json`) : `building-native-ui`, `upgrading-expo`, `expo-deployment`, `expo-cicd-workflows`, `accessibility`, `vercel-react-best-practices`, `vercel-composition-patterns`, `typescript-advanced-types`.
