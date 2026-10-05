---
name: storage-migration
description: Méthode pour faire évoluer la forme d'une donnée stockée dans AsyncStorage (parties, joueurs, statistiques) sans perdre ni casser les données déjà présentes sur les téléphones. À utiliser dès qu'un type persisté de src/types ou d'un contexte change.
---

Les données vivent uniquement sur l'appareil de l'utilisateur ; une erreur ici efface ou corrompt des parties sans retour possible.

Clés actuelles : voir le tableau « Persistance » de `docs/ARCHITECTURE.md`.

## 1. Classer le changement

| Changement | Stratégie |
|---|---|
| Ajout d'un champ | Champ **optionnel** dans le type + valeur par défaut à la lecture. Pas de migration. |
| Renommage / changement de type d'un champ | Lecture tolérante (accepter l'ancien et le nouveau format) + normalisation à la lecture, réécriture au prochain enregistrement. |
| Suppression d'un champ | Arrêter de l'écrire ; continuer à ignorer sa présence. |
| Restructuration (nouvelle clé, découpage) | Migration explicite et versionnée (étape 2). |

Exemple existant : `RoundBonus.treasureAlliance` accepte `number` (ancien format) ou `TreasureAllianceBonus[]`, et `calculateTreasureAllianceBonus` renvoie 0 pour l'ancien format.

## 2. Migration versionnée (si nécessaire)

- Ajouter une clé `board_games_schema_version` (entier) ; absence = version 1.
- Écrire `src/utils/migrations.ts` : une fonction pure par palier `migrateVnToVn+1(data)`, + `runMigrations()` appelée **une fois** au démarrage (dans `app/_layout.tsx`, avant de rendre les providers ou dans un provider dédié), qui lit, transforme, écrit, puis met à jour la version.
- Idempotente, et ne supprime l'ancienne clé qu'après écriture réussie de la nouvelle.
- En cas d'erreur : journaliser et laisser les données d'origine intactes.

## 3. Tests obligatoires

Dans `src/utils/__tests__/` : un objet JSON **réel de l'ancien format** (copié d'un état produit par la version actuelle) → lecture / migration → résultat attendu. Tester aussi une donnée déjà migrée (idempotence) et une donnée partielle ou corrompue.

## 4. Communication

- Commit `feat(storage)!:` ou `fix(storage):` avec `BREAKING CHANGE:` si une ancienne version de l'app ne pourrait plus relire les données.
- Mettre à jour le tableau des clés dans `docs/ARCHITECTURE.md` et le CHANGELOG.
