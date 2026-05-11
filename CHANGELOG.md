# Changelog

Tous les changements notables de ce projet sont documentés dans ce fichier.

## [1.2.0] - 2026-05-12

### 🎉 Nouveautés
- **Onglet Historique**: Affichage des parties en cours avec graphices SVG personnalisés montrant l'évolution des scores
- **Tab Subtitles**: Ajout de sous-titres descriptifs à tous les onglets (Jeux, Historique, Statistiques)
- **Stats Unifiées**: Vue globale des statistiques sans distinction "par joueur / par mode"
- **Classement par Victoires**: Affichage principal basé sur le nombre de victoires (NW)

### 🔧 Corrections
- **Android Bundling Fix**: Suppression de `react-native-chart-kit` qui causait des erreurs de bundling
- **Score Total**: Création de la première manche au démarrage du jeu pour affichage correct du score cumulatif
- **TypeScript Linter**: Correction complète de tous les avertissements ESLint (6 → 0 avertissements)
- **React Hooks Dependencies**: Ajout des dépendances manquantes aux useEffect

### 🚀 Infrastructure
- **Rascal Integration**: Rascal est maintenant une variante de Skull King
- **Jeu Préféré**: Affichage complet "Skull King - Nom de la Variante" au lieu de "Mode préféré"
- **Suppression Stats**: Suppression de "Score moyen" (stat ambigüe selon les variantes)

### 📊 Statistiques de Qualité
- ✅ **TypeScript**: 0 erreurs de compilation
- ✅ **ESLint**: 0 avertissements
- ✅ **Tests Lint**: Tous les tests passent

### 📦 Dépendances
- `react-native-svg@^15.15.5`: Pour les graphiques SVG personnalisés
- Suppression de `react-native-chart-kit` (incompatible avec le bundling Android)
- Suppression de `victory-native` (remplacé par SVG custom)

### 🏗️ Architecture
- **History Tab**: Graphiques SVG natifs pour l'évolution des scores par joueur
- **Stats Page**: Réorganisation complète avec vue unifiée
- **Tab Layout**: Labels clairs avec sous-titres descriptifs

---

## [1.1.1] - 2026-05-11

### 🎯 Corrections
- Bonus de Treasure Alliance correctement vérifiés (les deux joueurs doivent respecter leur mise)
- Affichage du score total dans le résumé de manche
- Ajustements mineurs de l'interface

---

## [1.1.0] - 2026-05-10

### ✨ Premiers changements majeurs
- Implémentation du mode Histoire avec graphiques
- Réorganisation complète de l'interface des statistiques
- Mise en place de la logique de scoring corrigée selon les règles officielles

---

## [1.0.0] - 2026-05-01

### 🎮 Version Initiale
- Implémentation de base du jeu Skull King
- Interface de base avec tabs (Jeux, Statistiques)
- Gestion des parties et des joueurs
- Système de scoring simplifié

