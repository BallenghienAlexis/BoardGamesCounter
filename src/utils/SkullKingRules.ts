// Skull King Game Configuration & Rules
import type { RoundBonus, TreasureAllianceBonus } from '../types/SkullKing';

export { RoundBonus, TreasureAllianceBonus };

export const SKULL_KING_ROUNDS = 10;

export const DEFAULT_CARDS_PER_ROUND = Array.from({ length: SKULL_KING_ROUNDS }, (_, i) => i + 1);

export const SKULL_KING_GAME_MODES = {
  base: {
    id: 'base',
    name: 'Jeu de Base',
    description: 'Les règles classiques de Skull King',
    includeExtensions: false,
  },
  'base-extension': {
    id: 'base-extension',
    name: 'Jeu de Base + Extension',
    description: 'Avec cartes additionnelles et variantes',
    includeExtensions: true,
  },
  incremental: {
    id: 'incremental',
    name: 'Mode Incremental',
    description: 'Scoring simplifié: +1/-1 par mise correcte/échouée',
    includeExtensions: false,
  },
  rascal: {
    id: 'rascal',
    name: 'Mode Rascal',
    description: 'Système équilibré où tous ont le même potentiel',
    includeExtensions: false,
  },
};

export const SCORING_SYSTEMS = {
  'skull-king': {
    id: 'skull-king',
    name: 'Skull King',
    description: 'Système classique avec bonification/pénalité',
  },
  rascal: {
    id: 'rascal',
    name: 'Rascal',
    description: 'Système équilibré avec coup direct/frappe/échec',
  },
};

/**
 * Calculate treasure alliance bonus points
 * IMPORTANT: BOTH players get +20 bonus (player who played AND player who won)
 * Both players must have correct bets for the bonus to apply
 */
export function calculateTreasureAllianceBonus(
  playerId: string,
  alliances: TreasureAllianceBonus[] | number,
  playerBets: Record<string, number>,
  playerTricks: Record<string, number>
): number {
  // If alliances is just a number (count), return 0
  if (typeof alliances === 'number') {
    return 0;
  }

  let totalBonus = 0;

  alliances.forEach((alliance) => {
    // Check if BOTH players have correct bets:
    // 1. Player who played the treasure (alliance.playedBy)
    const playedByBet = playerBets[alliance.playedBy];
    const playedByTricks = playerTricks[alliance.playedBy];
    const playedByCorrect =
      (playedByBet === 0 && playedByTricks === 0) ||
      (playedByBet > 0 && playedByBet === playedByTricks);

    // 2. Player who won the treasure (alliance.wonBy)
    const wonByBet = playerBets[alliance.wonBy];
    const wonByTricks = playerTricks[alliance.wonBy];
    const wonByCorrect =
      (wonByBet === 0 && wonByTricks === 0) ||
      (wonByBet > 0 && wonByBet === wonByTricks);

    // Bonus applies to BOTH players only if BOTH guessed correctly
    if (playedByCorrect && wonByCorrect) {
      // Check if this alliance applies to current player
      if (playerId === alliance.playedBy || playerId === alliance.wonBy) {
        totalBonus += 20; // +20 for each valid alliance this player is involved in
      }
    }
  });

  return totalBonus;
};

export function calculateSkullKingScore(
  bet: number,
  tricksWon: number,
  cardsDistributed: number,
  bonuses: Partial<RoundBonus> = {},
  isExtension: boolean = false,
  playerId?: string,
  playerBets?: Record<string, number>,
  playerTricks?: Record<string, number>
): { miseScore: number; bonusScore: number; totalScore: number } {
  let miseScore = 0;

  // Calcul des points de mise
  if (bet === 0) {
    if (tricksWon === 0) {
      // Mise sur 0 réussie: +10 × cartes distribuées
      miseScore = 10 * cardsDistributed;
    } else {
      // Mise sur 0 échouée: -10 × cartes distribuées
      miseScore = -10 * cardsDistributed;
    }
  } else {
    if (tricksWon === bet) {
      // Mise exacte: +20 × nombre de plis
      miseScore = 20 * bet;
    } else {
      // Écart: -10 × |différence|
      miseScore = -10 * Math.abs(tricksWon - bet);
    }
  }

  // Calcul des points bonus
  // ⚠️ IMPORTANT: Les bonus s'appliquent INDÉPENDAMMENT de la mise (sauf le butin qui a sa propre logique)
  let bonusScore = 0;

  // Bonus simples (ne dépendent pas de la mise exacte)
  bonusScore += (bonuses.card14Regular || 0) * 10; // +10 par carte 14 régulière
  bonusScore += (bonuses.card14Black || 0) * 20; // +20 pour le 14 noir
  bonusScore += (bonuses.sirenCapturedByPirate || 0) * 20; // +20 par sirène capturée par pirate
  bonusScore += (bonuses.pirateCapturedBySkullKing || 0) * 30; // +30 par pirate capturé par SK
  bonusScore += (bonuses.sirenCapturedSkullKing || 0) * 40; // +40 si sirène capture SK

  // Bonus extension (ne dépendent pas de la mise exacte non plus)
  if (isExtension) {
    bonusScore += (bonuses.secondCaptured || 0) * 30; // +30 si SK ou Sirène capture le Second
    bonusScore += (bonuses.davyJonesCasketCount || 0) * 20; // +20 per léviathan détruit
    bonusScore += (bonuses.eightCardBonus || 0) * 5; // +5 per 8 won
    bonusScore -= (bonuses.sevenCardBonus || 0) * 5; // -5 per 7 won
  }

  // Butin: SEUL bonus soumis à la condition de mise exacte
  if (bonuses.treasureAlliance && playerId && playerBets && playerTricks) {
    const treasureBonus = calculateTreasureAllianceBonus(playerId, bonuses.treasureAlliance, playerBets, playerTricks);
    bonusScore += treasureBonus;
  }

  const totalScore = miseScore + bonusScore;
  return { miseScore, bonusScore, totalScore };
}

export function calculateIncrementalScore(
  bet: number,
  tricksWon: number
): number {
  // Simple: +1 si correct, -1 si incorrect
  return bet === tricksWon ? 1 : -1;
}

export function calculateRascalScore(
  bet: number,
  tricksWon: number,
  cardsDistributed: number,
  bonuses: Partial<RoundBonus> = {},
  isCannonBall: boolean = false,
  isExtension: boolean = false,
  playerId?: string,
  playerBets?: Record<string, number>,
  playerTricks?: Record<string, number>
): { miseScore: number; bonusScore: number; totalScore: number } {
  const potentialPoints = cardsDistributed * 10;
  let miseScore = 0;

  const difference = Math.abs(tricksWon - bet);

  if (isCannonBall) {
    // Boulet de canon: +15 per card if exact, 0 otherwise
    if (difference === 0) {
      miseScore = cardsDistributed * 15;
    } else {
      miseScore = 0;
    }
  } else {
    // Chevrotine (standard Rascal)
    if (difference === 0) {
      // Coup direct: all points
      miseScore = potentialPoints;
    } else if (difference === 1) {
      // Frappe à revers: half points
      miseScore = potentialPoints / 2;
    } else {
      // Échec cuisant: no points
      miseScore = 0;
    }
  }

  // Apply bonus multiplier based on precision
  let bonusScore = 0;
  
  // Bonus simples (ne dépendent pas de la mise exacte - système Rascal spécifique)
  if (difference === 0) {
     // Coup direct: all bonuses
     bonusScore += (bonuses.card14Regular || 0) * 10;
     bonusScore += (bonuses.card14Black || 0) * 20;
     bonusScore += (bonuses.sirenCapturedByPirate || 0) * 20;
     bonusScore += (bonuses.pirateCapturedBySkullKing || 0) * 30;
     bonusScore += (bonuses.sirenCapturedSkullKing || 0) * 40;

     if (isExtension) {
       bonusScore += (bonuses.secondCaptured || 0) * 30;
       bonusScore += (bonuses.davyJonesCasketCount || 0) * 20;
       bonusScore += (bonuses.eightCardBonus || 0) * 5;
       bonusScore -= (bonuses.sevenCardBonus || 0) * 5;
     }
   } else if (difference === 1) {
     // Frappe à revers: half bonuses
     bonusScore += (bonuses.card14Regular || 0) * 5;
     bonusScore += (bonuses.card14Black || 0) * 10;
     bonusScore += (bonuses.sirenCapturedByPirate || 0) * 10;
     bonusScore += (bonuses.pirateCapturedBySkullKing || 0) * 15;
     bonusScore += (bonuses.sirenCapturedSkullKing || 0) * 20;

     if (isExtension) {
       bonusScore += (bonuses.secondCaptured || 0) * 15;
       bonusScore += (bonuses.davyJonesCasketCount || 0) * 10;
       bonusScore += (bonuses.eightCardBonus || 0) * 2;
       bonusScore -= (bonuses.sevenCardBonus || 0) * 2;
     }
   }
   // Échec cuisant: no bonuses
   
   // Butin: appliqué selon la condition de mise pour les deux joueurs (uniquement en Rascal)
   if (difference === 0 && bonuses.treasureAlliance && playerId && playerBets && playerTricks) {
     const treasureBonus = calculateTreasureAllianceBonus(playerId, bonuses.treasureAlliance, playerBets, playerTricks);
     bonusScore += treasureBonus;
   } else if (difference === 1 && bonuses.treasureAlliance && playerId && playerBets && playerTricks) {
     const treasureBonus = calculateTreasureAllianceBonus(playerId, bonuses.treasureAlliance, playerBets, playerTricks);
     bonusScore += Math.floor(treasureBonus / 2); // Half bonus on frappe à revers
   }

  const totalScore = miseScore + bonusScore;
  return { miseScore, bonusScore, totalScore };
}



