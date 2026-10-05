---
name: feature
description: Orchestre le workflow complet d'ajout d'une fonctionnalité dans BoardGamesCounter - plan, branche, développement, tests, revue, commits conventionnels et PR. À utiliser quand l'utilisateur demande une nouvelle fonctionnalité ou une évolution.
argument-hint: <description de la fonctionnalité>
---

Fonctionnalité demandée : $ARGUMENTS

Suis `docs/WORKFLOW.md`. Délègue chaque étape à l'agent indiqué (outil Agent) et ne passe à la suivante que lorsque la précédente est terminée.

1. **Plan** : agent `planner` avec la demande. Si le plan touche les règles de score, faire valider la section « Règles de score » par `skull-king-rules-expert`. Enregistrer le plan dans `docs/plans/<AAAA-MM-JJ>-<slug>.md`. S'il reste une question qui change le résultat pour l'utilisateur, la poser maintenant ; sinon continuer avec les défauts notés.
2. **Branche** : `git switch master && git pull`, puis `git switch -c feat/<slug>` (nom tiré du plan).
3. **Développement** : agent `feature-developer` avec le chemin du plan.
4. **Tests** : agent `test-engineer` sur les fichiers modifiés. Tout doit passer : `npm run lint && npm run typecheck && npm test`.
5. **Revue** : skill `/review-changes`. Corriger chaque point bloquant (retour à l'étape 3) jusqu'au verdict ✅.
6. **Docs** : agent `doc-keeper` si une fonctionnalité visible, une clé de stockage ou une règle a changé. Vérifier l'entrée `[Unreleased]` du CHANGELOG.
7. **Commits** : skill `/commit`.
8. **PR** : pousser la branche et ouvrir une PR (titre conventionnel, corps selon `.github/pull_request_template.md`, lien vers le plan). Suivre la CI jusqu'au vert.

Compte rendu final : lien de la PR, résumé du changement, tests manuels à faire par l'utilisateur dans l'app.
