---
name: review-changes
description: Revue complète du diff courant de BoardGamesCounter avant PR ou merge, en lançant le code-reviewer et les experts adaptés au contenu du diff (règles de score, UI mobile, docs). À utiliser avant d'ouvrir une PR ou quand on demande une revue.
argument-hint: "[base, par défaut origin/master]"
---

Base de comparaison : $ARGUMENTS (si vide : `origin/master`)

## Fichiers modifiés par rapport à origin/master

```!
git diff --stat origin/master...HEAD 2>/dev/null || true
git status --short
```

1. `git fetch origin master` puis `git diff --stat <base>...HEAD` et `git status` (inclure les changements non commités).
2. Lancer en parallèle (outil Agent) :
   - toujours : `code-reviewer` ;
   - si le diff touche `src/utils/SkullKingRules.ts`, `src/types/SkullKing.ts`, `app/skull-king/[gameId].tsx` ou un calcul de score : `skull-king-rules-expert` ;
   - si le diff touche `app/` ou `src/components/` : `mobile-ux-reviewer` ;
   - si le diff touche `*.md`, `package.json`, `app.json`, `eas.json` ou `.github/` : `doc-keeper` en mode audit (sans modifier).
3. Fusionner les rapports en un seul, dédupliqué, classé : **Bloquant**, **À corriger**, **Suggestions**, avec `fichier:ligne` et correctif proposé.
4. Verdict global : ✅ prêt / ⚠️ à corriger / ❌ bloquant.

Ne modifie pas le code pendant la revue ; propose ensuite de corriger les points bloquants.
