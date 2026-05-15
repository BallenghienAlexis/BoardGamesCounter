# Changelog

All notable changes to this project will be documented in this file.

## [1.2.7] - 2026-05-15

### Fixed - Finished Games Display
- ✅ Finished games (10/10 manches completed) no longer appear in "Parties en cours" list
- ✅ Added missing `finishGame()` call when game is complete
- ✅ Game status correctly tracked: currentRound = 11 when finished, removed from active games

### Features - Unified Graph Visualization
- ✅ History tab now displays all players on ONE graph with different colors
- ✅ Added color legend for easy player identification
- ✅ Game-end screen now shows evolution chart of entire game
- ✅ Multiple player curves visible simultaneously for comparison

### Changes
- `app/skull-king/[gameId].tsx`: Added `finishGame()` import and call
- `src/contexts/SkullKingContext.tsx`: Updated getUnfinishedGames() documentation
- `app/(tabs)/history.tsx`: Refactored SimpleLineChart for multi-player support
- `app/skull-king/game-end.tsx`: Added GameProgressChart component

## [1.2.6] - 2026-05-15

### Fixed - Treasure Bonus Storage Bug
- ✅ **CRITICAL FIX**: Treasure (Butin) bonus now correctly awarded to BOTH players
- ✅ Root cause: Alliance was only stored in player who PLAYED the card, not in player who WON
- ✅ Solution: Alliance is now stored in BOTH players' bonuses

## [1.2.5] - 2026-05-15

### Fixed - Treasure Card Bonus Bug (CORRECTED)
- ✅ **CORRECTED**: Treasure (Butin) card bonus - BOTH players get +20 bonus (not just winner)
  - **Rule**: "vous gagnez **CHACUN** 20 points bonus"

## [1.2.2] - 2026-05-14

### Fixed
- ✅ Fixed game disappearing when quitting mid-round
- Games now properly persist to storage with explicit save before navigation
- Changed exit behavior: clicking quit button now returns to game list instead of home
- Added `exitGameCleanly()` context function to ensure state is saved before leaving a game
- Resolved timing issues where games would vanish from "In Progress" list due to auto-save delays

## [1.2.1] - 2026-05-14

### Fixed
- ✅ Fixed cumulative score calculation bug causing alternating round scores
- Score display now correctly accumulates across all rounds (was only counting odd/even rounds)
- Updated calculation logic in `updateRoundScore()` to properly sum previous rounds before adding current round score

## [1.2.0] - 2026-05-12

### Added
- ✨ New History tab with game evolution graphs
- 📊 Line chart visualization of score progression across rounds
- 🏆 Current standings with medal rankings (🥇🥈🥉)
- 📋 Game favorites now display full "Game + Variant" names
- 📝 Subtitles added to all navigation tabs

### Changed
- 🔄 Reorganized Statistics view to be unified and global
- Scoring now based on victories (games won) instead of average score
- Rascal integrated as a Skull King variant
- Removed "Average Score" statistic (ambiguous across variants)

### Fixed
- ✅ Android bundling fixed (removed react-native-chart-kit, implemented custom SVG charts)
- ✅ Linter warnings reduced to 0 (fixed all React Hook dependencies)

## [1.1.1] - 2026-05-11

### Fixed
- ✅ Treasure Alliance bonus verification - validates both players' bets
- ✅ Bonus scoring now independent of bet accuracy (except Treasure Alliance)
- ✅ Score summary now displays both round score and cumulative total
- ✅ Moved treasure alliance selection to end of bonus phase for better UX

## [1.1.0] - 2026-05-10

### Added
- 🎮 Rascal game mode with scoring system (+1/-1 per round)
- 💰 Treasure Alliance bonus system with multi-player verification
- 📈 Per-round and cumulative score tracking

### Changed
- ♻️ Refactored bonus calculation with new `TreasureAllianceBonus` interface
- Updated scoring rules to match official Skull King rulebook

## [1.0.0] - 2026-05-01

### Initial Release
- 🎯 Core Skull King game modes (Base, Base+Extension, Incremental)
- 🎲 Game creation and round management
- 📊 Stats tracking with victory counts
- 💾 Local storage persistence
- 🎨 Native UI with Expo Router

