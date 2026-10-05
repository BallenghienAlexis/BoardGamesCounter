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
| ❓ À confirmer | Bonus sans mise réussie | `calculateSkullKingScore` ajoute les bonus de capture et de 14 même si la mise est ratée (choix du CHANGELOG 1.1.1). Les règles officielles de Skull King ne les accordent qu'en cas de mise réussie. | Décider de la règle voulue ; si changement, passer par `skull-king-rules-expert` et mettre à jour les tests. |
| Moyenne | Version de `react-native-svg` | `^15.15.5` installé, `15.12.1` attendu par Expo SDK 54 (`npx expo install --check`). | `npx expo install react-native-svg` puis tester les graphiques. |
| Moyenne | `SafeAreaView` de `react-native` | Utilisé dans `app/[gameId].tsx`, `app/skull-king/index.tsx`, `src/components/GameTypeSelector.tsx` ; déprécié et inefficace sur Android edge-to-edge. | Remplacer par `react-native-safe-area-context`. |
| Moyenne | Écrans volumineux | `app/skull-king/[gameId].tsx` (≈ 700 lignes), `app/(tabs)/index.tsx` (≈ 680), `app/skull-king/index.tsx` (≈ 620). | Extraire composants et logique dans `src/components/` et `src/utils/` (testables). |
| Basse | Typage | ≈ 27 occurrences de `any` dans `app/` et `src/`. | Typer progressivement lors des modifications. |
| Basse | Barème Rascal dupliqué | Les montants de bonus sont recopiés (plein / moitié) dans `calculateRascalScore`. | Factoriser via une table de bonus + multiplicateur, couvert par les tests existants. |
| Basse | Restes du template Expo | `app/modal.tsx`, `components/`, `hooks/`, `constants/`, images `react-logo*`, script `reset-project` (déplace `app/` !). Aucun écran de l'app ne les utilise. | Supprimer dans une PR `chore: remove expo template leftovers` après vérification. |
| Basse | `.agents/` | Ignoré dans `.gitignore` mais suivi par git ; `composition-patterns` listé dans `skills-lock.json` mais absent. | Décider : versionner (retirer de `.gitignore`) ou retirer du dépôt. |
| Basse | Licence | Le README annonçait MIT sans fichier `LICENSE`. | Ajouter un `LICENSE` si le projet doit être sous licence MIT. |
| Basse | Mises à jour OTA | `expo-updates` installé et configuré dans `app.json`, mais sans `channel` dans `eas.json`. | Configurer (voir `docs/DEPLOYMENT.md`) ou retirer la dépendance. |
