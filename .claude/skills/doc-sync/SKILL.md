---
name: doc-sync
description: Vérifie que la documentation de BoardGamesCounter (README, CLAUDE.md, docs/, CHANGELOG) correspond au code actuel et corrige les écarts. À utiliser après une fonctionnalité, avant une release, ou quand on soupçonne une doc obsolète.
---

Délègue à l'agent `doc-keeper` :

1. Audit complet selon sa grille (versions, commandes, arborescence, clés de stockage, règles de score, CHANGELOG vs `git log`, liens, liste des agents/skills).
2. Présenter le tableau des écarts.
3. Corriger les écarts sur une branche `docs/<slug>`, puis `/commit` avec le type `docs`.
