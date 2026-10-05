---
name: validate
description: Lance toutes les vérifications locales de BoardGamesCounter (lint, typecheck, tests, cohérence des versions, configuration EAS) et résume les erreurs. À utiliser avant un commit, une PR ou un build.
allowed-tools: Bash(npm run validate) Bash(npm ci) Bash(npx expo install --check)
---

1. Si `node_modules` est absent : `npm ci`.
2. `npm run validate` (exécute `scripts/validate-build.js` : fichiers requis, typecheck, lint, tests, versions `package.json` = `app.json`, profil EAS).
3. Optionnel si le réseau est disponible : `npx expo install --check` (écarts avec les versions attendues par le SDK).
4. Résumer : ✅ / ❌ par étape ; pour chaque erreur, `fichier:ligne` et la correction proposée. Ne pas corriger automatiquement sans accord, sauf erreurs de lint triviales si on te le demande.
