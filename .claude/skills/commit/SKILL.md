---
name: commit
description: Crée des commits Conventional Commits propres pour BoardGamesCounter à partir des changements en cours, en les découpant par sujet et en vérifiant lint, typecheck et tests. À utiliser quand on demande de commiter.
argument-hint: "[indication de type/scope]"
---

Indication : $ARGUMENTS

1. Refuser de commiter sur `master` : proposer une branche `<type>/<slug>` (voir `docs/WORKFLOW.md` §3).
2. `git status` et `git diff` (y compris indexé). Regrouper les changements par sujet cohérent ; un sujet = un commit.
3. Pour chaque groupe :
   - `git add <fichiers du groupe>` (jamais `git add -A` à l'aveugle ; ne jamais commiter `.env*`, clés, `android/`, `ios/`) ;
   - message :
     ```
     <type>(<scope>): <résumé impératif, minuscule, sans point, ≤ 72 caractères>

     <pourquoi, si non évident>

     <BREAKING CHANGE: … | Closes #N>
     ```
   - types : `feat`, `fix`, `perf`, `refactor`, `test`, `docs`, `style`, `build`, `ci`, `chore` ;
   - scopes : `skull-king`, `rascal`, `scoring`, `stats`, `history`, `players`, `storage`, `ui`, `nav`, `deps`, `ci`, `release`, `docs`.
   - `!` après le scope si les données stockées deviennent incompatibles.
4. Avant le premier commit : `npm run lint && npm run typecheck && npm test`. Ne jamais utiliser `--no-verify`.
5. Vérifier qu'un `feat`/`fix`/`perf` a son entrée sous `## [Unreleased]` dans `CHANGELOG.md`.
6. Afficher `git log --oneline origin/master..HEAD`.

Pas de liste de fichiers ni de journal de travail dans le message : le diff fait foi.
