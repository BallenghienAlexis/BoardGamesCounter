---
paths:
  - "package.json"
  - "app.json"
  - "eas.json"
  - ".github/**"
  - "scripts/**"
  - "CHANGELOG.md"
---

# Configuration, CI et release

- `package.json` `version` et `app.json` `expo.version` doivent rester identiques (vérifié par la CI et `npm run validate`). Le `versionCode` Android est géré par EAS (`appVersionSource: remote`), ne pas l'ajouter.
- Dépendances Expo : `npx expo install <pkg>` (versions compatibles SDK 54), jamais une version native au hasard.
- Workflows : Node 22, permissions minimales ; `build-apk.yml` consomme un build EAS par exécution.
- Ne jamais pousser de tag `v*` sans demande explicite de l'utilisateur.
- CHANGELOG au format Keep a Changelog, nouvelles entrées sous `[Unreleased]`.
- Détails : `docs/DEPLOYMENT.md`, agent `release-manager`, skill `/release`.
