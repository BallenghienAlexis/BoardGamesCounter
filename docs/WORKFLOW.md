# Workflow de développement

Ce document décrit le chemin complet d'une fonctionnalité ou d'un correctif, de l'idée à l'APK publié, et quel agent / skill Claude Code intervient à chaque étape. Les agents sont dans `.claude/agents/`, les skills dans `.claude/skills/`.

```
 1. Cadrer      →  2. Planifier  →  3. Brancher  →  4. Développer  →  5. Tester
 (issue)           planner          git            feature-developer   test-engineer
                                                                        ↓
10. Déployer   ←  9. Release    ←  8. Merger   ←  7. PR + CI     ←  6. Revoir
 build-apk.yml     release-mgr     squash          /commit             code-reviewer (+ experts)
```

Raccourci : le skill **`/feature <description>`** enchaîne les étapes 2 à 7 en déléguant à chaque agent. **`/bugfix`** fait de même pour un bug.

---

## 1. Cadrer

- Ouvrir une issue GitHub avec le modèle *Fonctionnalité* ou *Bug* (`.github/ISSUE_TEMPLATE/`).
- Préciser : le besoin utilisateur, le mode de jeu concerné (base, extension, incrémental, Rascal…), les critères d'acceptation.

## 2. Planifier — agent `planner`

Avant toute ligne de code, l'agent `planner` (lecture seule) produit un plan :

- objectif et critères d'acceptation ;
- fichiers à créer / modifier (routes `app/`, contextes, `SkullKingRules.ts`…) ;
- impact sur les **données stockées** (clés AsyncStorage, compatibilité des parties en cours) ;
- impact sur les **règles de score** (si oui : l'agent `skull-king-rules-expert` valide) ;
- tests à écrire ;
- découpage en commits ;
- risques et questions ouvertes.

Pour une tâche non triviale, le plan est enregistré dans `docs/plans/AAAA-MM-JJ-<slug>.md` et lié dans la PR.

## 3. Brancher

| Règle | Détail |
|---|---|
| Branche par défaut | `master`, toujours déployable |
| Pas de push direct sur `master` | Tout passe par une PR |
| Nommage | `<type>/<description-courte>` : `feat/scores-par-joueur`, `fix/butin-mise-zero`, `docs/workflow`, `chore/deps-expo-55`, `refactor/storage-service`, `test/rascal` |
| Durée de vie | Courte : une branche = un sujet = une PR |
| Mise à jour | `git merge origin/master` dans la branche (pas de rebase sur une branche partagée) |
| Après merge | Supprimer la branche |
| Interdit | `git push --force` sur `master`, réécrire l'historique publié |

```bash
git switch master && git pull
git switch -c feat/ma-fonctionnalite
```

## 4. Développer — agent `feature-developer`

Conventions (détail dans `CLAUDE.md`) :

- TypeScript strict, pas de `any` nouveau.
- Logique métier **pure** dans `src/utils/` (testable), état dans `src/contexts/`, écrans dans `app/`, composants réutilisables dans `src/components/`.
- Couleurs via `useTheme()`, pas de couleur codée en dur sauf exception justifiée.
- Textes de l'interface en français.
- Toute écriture persistante passe par `storageService`.
- Changement de forme d'une donnée stockée → skill `storage-migration`.
- Ajout d'un nouveau jeu → skill `add-board-game`.

Boucle locale :

```bash
npm start            # Expo (a = Android, w = web)
npm run lint
npm run typecheck
npm test
```

## 5. Tester — agent `test-engineer`

- **Unitaires (Jest + jest-expo)** : obligatoires pour toute logique dans `src/utils/` (scores, statistiques, transformation de données). Fichiers dans `src/**/__tests__/*.test.ts`. Ne jamais mettre de tests dans `app/` (Expo Router les prendrait pour des routes).
- **Correctif de bug** : écrire d'abord un test qui échoue, puis corriger.
- **Manuel** : lancer l'app (Expo Go ou émulateur) et dérouler le scénario des critères d'acceptation ; pour toute modification d'écran, vérifier aussi une partie déjà en cours (reprise depuis l'accueil).
- Checklist de non-régression Skull King : créer une partie, saisir mises/plis/bonus sur 2 manches, quitter, reprendre, terminer, vérifier Historique et Statistiques.

## 6. Revoir — agent `code-reviewer` (+ experts)

Avant d'ouvrir la PR, lancer le skill `/review-changes` (ou l'agent `code-reviewer`) sur le diff. Il vérifie : correction, compatibilité des données stockées, hooks React, typage, tests, lisibilité, doc à jour.

Revues spécialisées selon le diff :

| Le diff touche… | Agent |
|---|---|
| `src/utils/SkullKingRules.ts`, calcul de score, bonus | `skull-king-rules-expert` |
| Écrans, composants, styles | `mobile-ux-reviewer` |
| Docs, scripts, versions, workflows | `doc-keeper` |

Les remarques bloquantes sont corrigées avant la PR ; les autres sont listées dans la description.

## 7. Commit et Pull Request — skill `/commit`

### Commits : [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/)

```
<type>(<scope>): <résumé à l'impératif, ≤ 72 caractères>

[corps : pourquoi, pas comment]

[BREAKING CHANGE: … | Closes #12]
```

| Type | Usage | Effet sur la version |
|---|---|---|
| `feat` | Nouvelle fonctionnalité | minor |
| `fix` | Correctif | patch |
| `perf` | Performance | patch |
| `refactor` | Restructuration sans changement de comportement | — |
| `test` | Tests | — |
| `docs` | Documentation | — |
| `style` | Formatage | — |
| `build` / `ci` | Dépendances, EAS, workflows | — |
| `chore` | Maintenance, release | — |

Scopes usuels : `skull-king`, `rascal`, `scoring`, `stats`, `history`, `players`, `storage`, `ui`, `nav`, `deps`, `ci`, `release`.

Un changement incompatible avec les données déjà enregistrées se signale par `!` (`feat(storage)!: …`) et un pied `BREAKING CHANGE:`.

Un commit = un changement cohérent qui passe lint, typecheck et tests. Le message de commit ne contient pas de liste de fichiers ni de journal d'implémentation.

### Pull Request

- Titre au format Conventional Commit (il devient le message du commit squashé).
- Description selon `.github/pull_request_template.md` : contexte, changements, tests réalisés, impact données, captures si UI.
- Ajouter une entrée sous `## [Unreleased]` du `CHANGELOG.md` pour tout `feat`, `fix` ou `perf`.
- La CI (`.github/workflows/ci.yml`) doit être verte : lint, typecheck, tests, cohérence des versions.

## 8. Merger

- **Squash and merge** uniquement, branche supprimée ensuite.
- Conditions : CI verte, revue faite, checklist de la PR cochée.

Réglages GitHub recommandés (*Settings → Branches → Add rule* sur `master`) :

- Require a pull request before merging.
- Require status checks to pass : `Lint, typecheck, tests`.
- Require linear history.
- Do not allow force pushes / deletions.
- *Settings → General* : n'autoriser que *Squash merging*, cocher *Automatically delete head branches*.

## 9. Release — agent `release-manager`, skill `/release`

1. Déterminer la version depuis les commits depuis le dernier tag (`feat` → minor, `fix`/`perf` → patch, `!` → major).
2. Bump identique dans `package.json` et `app.json`.
3. Basculer `[Unreleased]` en `[X.Y.Z] - date` dans `CHANGELOG.md`, mettre à jour la section version du `README.md`.
4. PR `chore(release): vX.Y.Z`, merge.
5. `git tag vX.Y.Z && git push origin vX.Y.Z`.

## 10. Déployer

Le tag déclenche `.github/workflows/build-apk.yml` → validation → build EAS → APK attaché à la GitHub Release. Détails et dépannage : [DEPLOYMENT.md](./DEPLOYMENT.md). Build local de secours : [ANDROID_LOCAL_BUILD.md](./ANDROID_LOCAL_BUILD.md).

Après déploiement : installer l'APK, dérouler la checklist de non-régression, et ouvrir une issue `fix` pour tout problème.

---

## Definition of Done

- [ ] Critères d'acceptation remplis et vérifiés dans l'app
- [ ] `npm run lint`, `npm run typecheck`, `npm test` verts
- [ ] Tests ajoutés pour toute logique dans `src/utils/`
- [ ] Parties et statistiques déjà enregistrées toujours lisibles
- [ ] Revue `code-reviewer` faite, remarques bloquantes traitées
- [ ] `CHANGELOG.md` (`[Unreleased]`) et docs concernées à jour
- [ ] Commits / titre de PR conventionnels
- [ ] CI verte

## Agents et skills disponibles

### Agents (`.claude/agents/`)

| Agent | Rôle | Étape |
|---|---|---|
| `planner` | Analyse la demande et produit un plan d'implémentation | 2 |
| `feature-developer` | Implémente un plan en respectant l'architecture | 4 |
| `test-engineer` | Écrit et exécute les tests Jest, propose les scénarios manuels | 5 |
| `code-reviewer` | Revue du diff : bugs, données, hooks, typage, tests | 6 |
| `skull-king-rules-expert` | Vérifie les calculs de score face aux règles officielles | 2, 6 |
| `mobile-ux-reviewer` | Revue UI mobile : accessibilité, thème, ergonomie en jeu | 6 |
| `debugger` | Reproduit un bug, trouve la cause racine, propose le correctif minimal | 4 (bug) |
| `doc-keeper` | Audite et met à jour la documentation | 6, 9, maintenance |
| `release-manager` | Version, changelog, tag, suivi du build | 9, 10 |
| `dependency-upgrader` | Montées de version Expo / dépendances | Maintenance |

### Skills (`.claude/skills/`, invoquables par `/nom`)

| Skill | Usage |
|---|---|
| `/feature` | Orchestre tout le workflow pour une fonctionnalité |
| `/bugfix` | Orchestre la correction d'un bug (test rouge → fix → revue) |
| `/review-changes` | Revue complète du diff courant avec les agents adaptés |
| `/validate` | Lance toutes les vérifications locales |
| `/commit` | Prépare des commits conventionnels propres |
| `/release` | Prépare une release (version, changelog, tag) |
| `/doc-sync` | Vérifie que la doc correspond au code |
| `add-board-game` | Guide pour ajouter un nouveau jeu de société |
| `storage-migration` | Guide pour faire évoluer une donnée stockée sans perdre les parties |
| `maintenance-audit` | Audit périodique : dépendances, dette technique, code mort |

Le dossier `.agents/skills/` contient en plus des skills de référence tiers (Expo, React, accessibilité…) listés dans `skills-lock.json`. Les agents peuvent les lire au besoin (par ex. `upgrading-expo`, `building-native-ui`, `accessibility`).

### Inspiration

Agents et skills écrits pour ce projet. Le découpage des rôles s'inspire du catalogue public [wshobson/agents](https://github.com/wshobson/agents) (`code-reviewer`, `test-automator`, `mobile-developer`, `docs-architect`, `deployment-engineer`, `debugger`), dont aucun contenu n'a été copié.
