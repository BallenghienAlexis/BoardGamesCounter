# 🎲 BoardGamesCounter

[![Version](https://img.shields.io/badge/version-1.2.2-blue.svg)](./package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Code Quality](https://img.shields.io/badge/code%20quality-A+-brightgreen.svg)]()

Un compteur de score pour les jeux de société, particulièrement optimisé pour **Skull King** avec versionning des règles et modes de jeu avancés.

## 📱 Fonctionnalités

### 🎮 Gestion des Jeux
- **Skull King**: Mode base, extension, incrémental et Rascal
- **Parties en cours**: Suivi progressif des manches
- **Reprise de parties**: Sauvegarde automatique des jeux en cours
- **Score détaillé**: Affichage détaillé des bonus et des calculs

### 📊 Statistiques
- **Classement des joueurs**: Tri par victoires et taux de victoire
- **Historique**: Graphiques d'évolution des scores par partie
- **Statistiques par variante**: Analyse des performances par mode de jeu
- **Vue unifiée**: Interface claire et intuitive

### 🎯 Historique
- **Graphiques SVG**: Visualisation de l'évolution des scores
- **Parties en cours**: Liste des jeux actuels avec progression
- **Standings**: Classement en temps réel avec médailles

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Développement

```bash
npm start
```

Sélectionnez votre plateforme:
- Android: `a`
- iOS: `i`
- Web: `w`

### Build Production

```bash
eas build --platform android
```

## 📦 Structure du Projet

```
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Main tabs
│   │   ├── index.tsx             # Page d'accueil - Gestion des jeux
│   │   ├── history.tsx           # Historique avec graphiques
│   │   └── stats.tsx             # Statistiques unifiées
│   └── skull-king/               # Routes spécifiques à Skull King
│       ├── [gameId].tsx          # Écran principal du jeu
│       ├── game-end.tsx          # Résumé final
│       ├── game-setup.tsx        # Configuration initiale
│       └── index.tsx             # Liste des jeux
├── src/
│   ├── components/               # Composants réutilisables
│   ├── contexts/                 # React Contexts (theming, game state)
│   ├── types/                    # Définitions TypeScript
│   └── utils/                    # Utilitaires (scoring, storage)
└── assets/                       # Images et ressources
```

## 🎯 Règles de Scoring

### Skull King - Mode Base
- **Mise exacte**: +20 × plis remportés
- **Mise 0 exacte**: +10 × cartes
- **Écart**: -10 points par différence
- **Bonus**: 
  - Cartes 14: +10 (régulière) ou +20 (noir)
  - Pirate capturé par SK: +30
  - Sirène capturée: +20 ou +40
  - Butin (Alliance): +20 (si les deux joueurs misent correctement)

### Skull King - Mode Rascal
- Variantes de scoring personnalisées
- Chevrotine ou Boulet de Canon

### Skull King - Mode Incrémental
- Mise exacte: +1
- Mise inexacte: -1

## 📊 Version Actuelle: v1.2.2

### 🔧 Corrections (v1.2.2)
- ✅ **Game Persistence Fix**: Corrigé la disparition des parties quand on quitte en cours de manche
  - Les parties sont maintenant explicitement sauvegardées avant la navigation
  - Bouton "Quitter" retourne à la liste des parties au lieu de l'accueil
  - Les jeux en cours restent accessibles même si on quitte sans finaliser la manche
- ✅ Implémented `exitGameCleanly()` pour garantir la sauvegarde avant quitter

### 🔧 Corrections Précédentes (v1.2.1)
- ✅ **Cumulative Score Fix**: Corrigé le bug d'affichage du score total entre manches
  - Les scores s'accumulent correctement (était seulement pair/impair avant)
  - Chaque manche ajoute correctement son score au total cumulatif
- ✅ Générateur de CHANGELOG automatisé

### ✨ Nouveautés & Corrections Cumulées (v1.2.0+)
- ✅ Onglet Historique avec graphiques SVG
- ✅ Vue statistiques unifiée
- ✅ Sous-titres aux onglets
- ✅ Rascal intégré comme variante de Skull King
- ✅ Android bundling fix
- ✅ 0 avertissements ESLint

📋 **[Voir le CHANGELOG complet →](./CHANGELOG.md)**

## 🛠️ Développement

### Code Quality
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

### Dépendances Principales
- **Expo**: 54.0.33
- **React Native**: 0.81.5
- **React Navigation**: 7.4.0
- **React Native SVG**: 15.15.5

## 🚀 Déploiement

### EAS Build (Android/iOS)
```bash
eas build --platform android
eas build --platform ios
```

### Web Hosting (Expo Hosting)
```bash
eas deploy
```

## 📞 Support

Pour les bugs ou les suggestions, veuillez ouvrir une issue.

## 📝 License

MIT - Libre d'utilisation

---

**Développeur**: Alexis Ballenghien
**Stack**: Expo + React Native + TypeScript
**Plateforme**: iOS, Android, Web
