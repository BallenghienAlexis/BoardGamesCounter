# Maintenance

## Routines

| Fréquence | Action | Outil |
|---|---|---|
| Chaque PR | Lint, typecheck, tests, cohérence des versions | CI `ci.yml`, skill `/validate` |
| Chaque fonctionnalité | Doc et CHANGELOG à jour | agent `doc-keeper`, skill `/doc-sync` |
| Mensuelle | Audit de santé (dépendances, dette, code mort, couverture) | skill `maintenance-audit` |
| À chaque SDK Expo (≈ 3 par an) | Montée de version dans une PR dédiée | agent `dependency-upgrader` |
| Hebdomadaire (automatique) | PR Dependabot pour les GitHub Actions | `.github/dependabot.yml` |

## Dette technique connue

Relevée lors de l'audit du 2026-10-05. Chaque point se traite dans sa propre PR (`/feature` ou `/bugfix`).

| Gravité | Sujet | Détail | Action proposée |
|---|---|---|---|
| Moyenne | `SafeAreaView` de `react-native` | Utilisé dans `app/[gameId].tsx`, `app/skull-king/index.tsx`, `src/components/GameTypeSelector.tsx` ; déprécié et inefficace sur Android edge-to-edge. | Remplacer par `react-native-safe-area-context`. |
| Moyenne | Écrans volumineux | `app/skull-king/[gameId].tsx` (≈ 700 lignes), `app/(tabs)/index.tsx` (≈ 680), `app/skull-king/index.tsx` (≈ 620). | Extraire composants et logique dans `src/components/` et `src/utils/` (testables). |
| Basse | Typage | ≈ 27 occurrences de `any` dans `app/` et `src/`. | Typer progressivement lors des modifications. |
| Basse | Barème Rascal dupliqué | Les montants de bonus sont recopiés (plein / moitié) dans `calculateRascalScore`. | Factoriser via une table de bonus + multiplicateur, couvert par les tests existants. |
| Basse | Restes du template Expo | `app/modal.tsx`, `components/`, `hooks/`, `constants/`, images `react-logo*`, script `reset-project` (déplace `app/` !). Aucun écran de l'app ne les utilise. | Supprimer dans une PR `chore: remove expo template leftovers` après vérification. |
| Basse | Skills tiers | Déplacés de `.agents/skills/` vers `.claude/skills/` (seul dossier lu par Claude Code) et réduits aux 8 utiles au projet. Un outil de type autoskills relancé les réinstallerait dans `.agents/`. | Mettre à jour à la main depuis leur dépôt source (`skills-lock.json`). |
| Basse | Licence | Le README annonçait MIT sans fichier `LICENSE`. | Ajouter un `LICENSE` si le projet doit être sous licence MIT. |
| Basse | Mises à jour OTA | `expo-updates` installé et configuré dans `app.json`, mais sans `channel` dans `eas.json`. | Configurer (voir `docs/DEPLOYMENT.md`) ou retirer la dépendance. |

## Décisions prises

| Date | Sujet | Décision |
|---|---|---|
| 2026-10-05 | Bonus avec une mise ratée | Conservés comme depuis la 1.1.1 : en mode Skull King, les bonus de 14 et de capture comptent même si la mise est ratée (seul le butin exige deux mises réussies). Choix de table assumé, différent de l'édition anglaise du livret. |
| 2026-10-05 | Bonus en boulet de canon | Corrigé (PR #8) : mise exacte obligatoire, conformément au livret. |
| 2026-10-05 | `react-native-svg` | Aligné sur la version attendue par Expo SDK 54 (PR #2). |
