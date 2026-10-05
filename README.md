# 🎲 BoardGamesCounter

[![Version](https://img.shields.io/badge/version-1.2.7-blue.svg)](./CHANGELOG.md)
[![CI](https://github.com/BallenghienAlexis/BoardGamesCounter/actions/workflows/ci.yml/badge.svg)](https://github.com/BallenghienAlexis/BoardGamesCounter/actions/workflows/ci.yml)

Compteur de scores pour jeux de société, pensé pour **Skull King** (modes base, extension, incrémental et Rascal). Application Expo / React Native, entièrement hors-ligne : les parties sont enregistrées sur le téléphone.

## 📱 Fonctionnalités

### 🎮 Parties
- **Skull King** : jeu de base, base + extension, mode incrémental, Rascal (chevrotine ou boulet de canon), de 2 à 6 joueurs, 10 manches.
- Saisie des mises, des plis et des bonus (14, captures, butin, cartes d'extension) avec détail du calcul.
- Sauvegarde automatique, reprise des **parties en cours** depuis l'accueil.
- Compteur de points générique pour les autres jeux.
- Joueurs mémorisés pour créer une partie en quelques taps.

### 📊 Historique et statistiques
- Graphique d'évolution des scores de tous les joueurs sur une même courbe (onglet Historique et fin de partie).
- Classement en temps réel avec médailles.
- Victoires et taux de victoire par joueur, globalement et par variante.

## 🚀 Démarrage

Pré-requis : Node.js 22 LTS.

```bash
npm install
npm start          # puis a = Android, i = iOS, w = Web
```

| Commande | Rôle |
|---|---|
| `npm start` | Serveur de développement Expo |
| `npm run lint` | ESLint (config Expo) |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Tests unitaires Jest |
| `npm run validate` | Toutes les vérifications avant build |

## 📦 Structure

```
app/            Écrans (Expo Router) : onglets, Skull King, compteur générique
src/components  Composants réutilisables
src/contexts    État global (joueurs, parties, Skull King, statistiques, thème)
src/utils       Règles de score, statistiques, stockage (+ tests dans __tests__/)
src/types       Types métier
docs/           Architecture, workflow, déploiement, maintenance
.claude/        Agents et skills Claude Code
```

Détails : [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 🎯 Règles de score (Skull King, mode base)

| Situation | Points |
|---|---|
| Mise exacte (≥ 1) | +20 × plis |
| Mise ratée (≥ 1) | −10 × écart |
| Mise 0 réussie / ratée | +10 / −10 × cartes distribuées |
| 14 de couleur / 14 noir | +10 / +20 |
| Sirène capturée par un pirate | +20 |
| Pirate capturé par le Skull King | +30 |
| Skull King capturé par une sirène | +40 |
| Butin (alliance) | +20 pour chacun des deux joueurs, si les deux ont réussi leur mise |

Extension, mode incrémental et Rascal : voir [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#règles-de-calcul-source--srcutilsskullkingrulests).

## 📊 Version actuelle : 1.2.7

Dernières corrections : les parties terminées n'apparaissent plus dans « Parties en cours », graphique multi-joueurs unifié, bonus de butin attribué aux deux joueurs. Historique complet : **[CHANGELOG.md](./CHANGELOG.md)**.

## 🛠️ Contribuer

Le processus complet (plan, branche, développement, tests, revue, commits conventionnels, release, déploiement) est décrit dans **[docs/WORKFLOW.md](./docs/WORKFLOW.md)**, avec les agents et skills Claude Code associés.

En bref : une branche `type/sujet` par changement, commits [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/), PR avec CI verte, squash merge sur `master`.

Dépendances principales : Expo SDK 54, React Native 0.81, React 19.1, Expo Router 6, React Native SVG 15, AsyncStorage 2.

## 🚀 Déploiement

```bash
# après avoir monté la version dans package.json et app.json, et mis à jour le CHANGELOG
git tag v1.2.8
git push origin v1.2.8   # GitHub Actions lance le build EAS et publie l'APK dans Releases
```

Guide complet : [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md). Build local Android : [docs/ANDROID_LOCAL_BUILD.md](./docs/ANDROID_LOCAL_BUILD.md).

## 📞 Support

Bugs et suggestions : ouvrir une [issue](https://github.com/BallenghienAlexis/BoardGamesCounter/issues).

---

**Développeur** : Alexis Ballenghien · **Stack** : Expo + React Native + TypeScript · **Plateformes** : Android (APK), iOS et Web via Expo
