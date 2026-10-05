---
name: bugfix
description: Corrige un bug de BoardGamesCounter selon le workflow du projet - reproduction par un test qui échoue, cause racine, correctif minimal, revue, commit fix et PR. À utiliser quand un bug ou un score incorrect est signalé.
argument-hint: <description du bug>
---

Bug signalé : $ARGUMENTS

1. Branche `fix/<slug>` depuis `master` à jour.
2. Agent `debugger` : reproduction, cause racine prouvée, test Jest qui échoue.
3. Si le bug concerne un calcul de score : agent `skull-king-rules-expert` pour confirmer le résultat attendu **avant** de corriger.
4. Correctif minimal (par `debugger` ou `feature-developer`), puis `npm run lint && npm run typecheck && npm test` : le nouveau test passe, aucun autre ne casse.
5. Vérifier l'impact sur les parties déjà enregistrées ; si elles sont corrompues, corriger à la lecture (skill `storage-migration`).
6. `/review-changes`, puis entrée `### Fixed` sous `[Unreleased]` du CHANGELOG.
7. `/commit` (type `fix(<scope>)`, pied `Closes #<issue>` si une issue existe), push, PR.

Compte rendu : cause racine en une phrase, lien de la PR, comment vérifier dans l'app.
