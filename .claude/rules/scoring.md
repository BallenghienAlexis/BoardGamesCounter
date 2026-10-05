---
paths:
  - "src/utils/SkullKingRules.ts"
  - "src/types/SkullKing.ts"
  - "app/skull-king/**"
---

# Règles de score Skull King

- Règles officielles de référence : `docs/rules/skull-king/` (livret de base et extension, Markdown + PDF).
- `src/utils/SkullKingRules.ts` est la seule source des calculs : pas de calcul de score dupliqué dans les écrans.
- Toute modification d'un calcul s'accompagne d'un test dans `src/utils/__tests__/SkullKingRules.test.ts` et d'une validation par l'agent `skull-king-rules-expert`.
- Décisions actées : butin = +20 pour **chacun** des deux joueurs si les deux ont réussi leur mise, alliance stockée chez les deux joueurs (CHANGELOG 1.2.5 / 1.2.6) ; bonus de capture et de 14 accordés même si la mise est ratée (1.1.1, confirmé le 2026-10-05, voir « Décisions prises » dans `docs/MAINTENANCE.md`).
- `RoundBonus.treasureAlliance` accepte encore l'ancien format numérique : ne pas casser cette lecture.
- Une partie est terminée quand `currentRound > config.cardsPerRound.length`.
- Tableau des règles à jour dans `docs/ARCHITECTURE.md` et le README après tout changement.
