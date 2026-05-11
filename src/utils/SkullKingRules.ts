// Skull King Game Configuration & Rules

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

// Skull King Scoring Functions
export function calculateSkullKingScore(
  bet: number,
  tricksWon: number,
  cardsDistributed: number,
  bonusPoints: number = 0
): { scoreFromBet: number; totalScore: number } {
  let scoreFromBet = 0;

  if (bet === 0) {
    if (tricksWon === 0) {
      // Mise sur 0 réussie: +10 × cartes distribuées
      scoreFromBet = 10 * cardsDistributed;
    } else {
      // Mise sur 0 échouée: -10 × cartes distribuées
      scoreFromBet = -10 * cardsDistributed;
    }
  } else {
    if (tricksWon === bet) {
      // Mise exacte: +20 × nombre de plis
      scoreFromBet = 20 * bet;
    } else {
      // Écart: -10 × |différence|
      scoreFromBet = -10 * Math.abs(tricksWon - bet);
    }
  }

  const totalScore = scoreFromBet + bonusPoints;
  return { scoreFromBet, totalScore };
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
  bonusPoints: number = 0,
  isCannonBall: boolean = false
): { scoreFromBet: number; totalScore: number } {
  const potentialPoints = cardsDistributed * 10;
  let scoreFromBet = 0;

  const difference = Math.abs(tricksWon - bet);

  if (isCannonBall) {
    // Boulet de canon: +15 per card if exact, 0 otherwise
    if (difference === 0) {
      scoreFromBet = cardsDistributed * 15;
    } else {
      scoreFromBet = 0;
    }
  } else {
    // Chevrotine (standard Rascal)
    if (difference === 0) {
      // Coup direct: all points
      scoreFromBet = potentialPoints;
    } else if (difference === 1) {
      // Frappe à revers: half points
      scoreFromBet = potentialPoints / 2;
    } else {
      // Échec cuisant: no points
      scoreFromBet = 0;
    }
  }

  // Apply bonus multiplier based on precision
  let bonusScore = bonusPoints;
  if (difference !== 0) {
    if (difference === 1) {
      bonusScore = bonusPoints / 2;
    } else {
      bonusScore = 0;
    }
  }

  const totalScore = scoreFromBet + bonusScore;
  return { scoreFromBet, totalScore };
}

