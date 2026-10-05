---
name: release
description: Prépare une nouvelle version de BoardGamesCounter (version SemVer, package.json, app.json, CHANGELOG, README, PR de release) puis, sur confirmation, pose le tag qui déclenche le build APK. À utiliser quand on veut publier une version.
argument-hint: "[patch|minor|major|X.Y.Z]"
disable-model-invocation: true
---

Version demandée : $ARGUMENTS (si vide : calculée depuis les commits)

## Depuis le dernier tag

```!
git describe --tags --abbrev=0 2>/dev/null || echo "(aucun tag)"
git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --oneline 2>/dev/null | head -50 || true
```

Délègue à l'agent `release-manager` en lui transmettant la version demandée, et suis `docs/DEPLOYMENT.md`.

Le tag `vX.Y.Z` déclenche un build EAS qui consomme le quota du compte Expo : ne pousse le tag **qu'après confirmation explicite de l'utilisateur** et une fois la PR de release mergée et la CI verte sur `master`.
