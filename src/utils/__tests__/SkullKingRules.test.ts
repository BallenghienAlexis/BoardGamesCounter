import {
  calculateIncrementalScore,
  calculateRascalScore,
  calculateSkullKingScore,
  calculateTreasureAllianceBonus,
  DEFAULT_CARDS_PER_ROUND,
  SCORING_SYSTEMS,
  SKULL_KING_GAME_MODES,
  SKULL_KING_ROUNDS,
} from '../SkullKingRules';

describe('configuration', () => {
  it('uses 10 rounds with 1 to 10 cards', () => {
    expect(SKULL_KING_ROUNDS).toBe(10);
    expect(DEFAULT_CARDS_PER_ROUND).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});

describe('calculateSkullKingScore - mise', () => {
  it('gives +20 per trick on an exact bet', () => {
    expect(calculateSkullKingScore(3, 3, 5).miseScore).toBe(60);
  });

  it('gives -10 per trick of difference on a missed bet', () => {
    expect(calculateSkullKingScore(3, 1, 5).miseScore).toBe(-20);
    expect(calculateSkullKingScore(1, 4, 5).miseScore).toBe(-30);
  });

  it('gives +10 x cards on a successful zero bet', () => {
    expect(calculateSkullKingScore(0, 0, 7).miseScore).toBe(70);
  });

  it('gives -10 x cards on a failed zero bet', () => {
    expect(calculateSkullKingScore(0, 2, 7).miseScore).toBe(-70);
  });
});

describe('calculateSkullKingScore - bonus', () => {
  it('adds base bonuses independently of the bet', () => {
    const result = calculateSkullKingScore(2, 0, 5, {
      card14Regular: 2, // +20
      card14Black: 1, // +20
      sirenCapturedByPirate: 1, // +20
      pirateCapturedBySkullKing: 2, // +60
      sirenCapturedSkullKing: 1, // +40
    });
    expect(result.miseScore).toBe(-20);
    expect(result.bonusScore).toBe(160);
    expect(result.totalScore).toBe(140);
  });

  it('ignores extension bonuses outside of extension mode', () => {
    const bonuses = { secondCaptured: 1, davyJonesCasketCount: 1, eightCardBonus: 1, sevenCardBonus: 1 };
    expect(calculateSkullKingScore(1, 1, 3, bonuses, false).bonusScore).toBe(0);
  });

  it('applies extension bonuses in extension mode', () => {
    const bonuses = { secondCaptured: 1, davyJonesCasketCount: 2, eightCardBonus: 2, sevenCardBonus: 1 };
    // +30 +40 +10 -5
    expect(calculateSkullKingScore(1, 1, 3, bonuses, true).bonusScore).toBe(75);
  });
});

describe('calculateTreasureAllianceBonus (butin)', () => {
  const alliance = [{ playedBy: 'a', wonBy: 'b' }];

  it('gives +20 to BOTH players when both bets are correct', () => {
    const bets = { a: 1, b: 2 };
    const tricks = { a: 1, b: 2 };
    expect(calculateTreasureAllianceBonus('a', alliance, bets, tricks)).toBe(20);
    expect(calculateTreasureAllianceBonus('b', alliance, bets, tricks)).toBe(20);
  });

  it('gives nothing to a player outside the alliance', () => {
    expect(calculateTreasureAllianceBonus('c', alliance, { a: 1, b: 1, c: 0 }, { a: 1, b: 1, c: 0 })).toBe(0);
  });

  it('gives nothing when one of the two players missed their bet', () => {
    const bets = { a: 1, b: 2 };
    const tricks = { a: 1, b: 3 };
    expect(calculateTreasureAllianceBonus('a', alliance, bets, tricks)).toBe(0);
    expect(calculateTreasureAllianceBonus('b', alliance, bets, tricks)).toBe(0);
  });

  it('treats a successful zero bet as correct', () => {
    expect(calculateTreasureAllianceBonus('a', alliance, { a: 0, b: 1 }, { a: 0, b: 1 })).toBe(20);
  });

  it('returns 0 for the legacy numeric format', () => {
    expect(calculateTreasureAllianceBonus('a', 2, { a: 1 }, { a: 1 })).toBe(0);
  });

  it('is included in the Skull King round score', () => {
    const result = calculateSkullKingScore(
      1,
      1,
      3,
      { treasureAlliance: alliance },
      false,
      'b',
      { a: 1, b: 1 },
      { a: 1, b: 1 }
    );
    expect(result.bonusScore).toBe(20);
    expect(result.totalScore).toBe(40);
  });
});

describe('calculateIncrementalScore', () => {
  it('gives +1 on an exact bet and -1 otherwise', () => {
    expect(calculateIncrementalScore(2, 2)).toBe(1);
    expect(calculateIncrementalScore(0, 0)).toBe(1);
    expect(calculateIncrementalScore(2, 3)).toBe(-1);
  });
});

describe('calculateRascalScore', () => {
  describe('chevrotine', () => {
    it('gives all potential points (10 x cards) on a direct hit', () => {
      expect(calculateRascalScore(2, 2, 5).miseScore).toBe(50);
    });

    it('gives half the points when off by one', () => {
      expect(calculateRascalScore(2, 3, 5).miseScore).toBe(25);
    });

    it('gives no points when off by two or more', () => {
      expect(calculateRascalScore(2, 4, 5).miseScore).toBe(0);
    });

    it('halves bonuses when off by one and drops them beyond', () => {
      const bonuses = { pirateCapturedBySkullKing: 1 };
      expect(calculateRascalScore(1, 1, 3, bonuses).bonusScore).toBe(30);
      expect(calculateRascalScore(1, 2, 3, bonuses).bonusScore).toBe(15);
      expect(calculateRascalScore(1, 3, 3, bonuses).bonusScore).toBe(0);
    });
  });

  describe('boulet de canon', () => {
    it('gives 15 x cards on a direct hit and nothing otherwise', () => {
      expect(calculateRascalScore(2, 2, 4, {}, true).miseScore).toBe(60);
      expect(calculateRascalScore(2, 3, 4, {}, true).miseScore).toBe(0);
    });
  });
});

describe('game modes and scoring systems', () => {
  it('declares the four Skull King modes, only base-extension with extensions', () => {
    expect(Object.keys(SKULL_KING_GAME_MODES)).toEqual(['base', 'base-extension', 'incremental', 'rascal']);
    const withExtensions = Object.values(SKULL_KING_GAME_MODES).filter(m => m.includeExtensions);
    expect(withExtensions.map(m => m.id)).toEqual(['base-extension']);
  });

  it('declares the skull-king and rascal scoring systems', () => {
    expect(Object.keys(SCORING_SYSTEMS)).toEqual(['skull-king', 'rascal']);
  });
});

describe('calculateSkullKingScore - edge cases', () => {
  it('returns only the bet score when no bonus is given', () => {
    expect(calculateSkullKingScore(2, 2, 4)).toEqual({ miseScore: 40, bonusScore: 0, totalScore: 40 });
  });

  it('ignores the treasure alliance when bets/tricks maps are missing', () => {
    const result = calculateSkullKingScore(1, 1, 3, { treasureAlliance: [{ playedBy: 'a', wonBy: 'b' }] }, false, 'a');
    expect(result.bonusScore).toBe(0);
  });

  it('counts each alliance a player is part of', () => {
    const alliances = [
      { playedBy: 'a', wonBy: 'b' },
      { playedBy: 'b', wonBy: 'a' },
    ];
    const bets = { a: 1, b: 1 };
    expect(calculateTreasureAllianceBonus('a', alliances, bets, bets)).toBe(40);
  });

  it('treats a player without a recorded bet as not correct', () => {
    expect(calculateTreasureAllianceBonus('a', [{ playedBy: 'a', wonBy: 'b' }], { a: 1 }, { a: 1 })).toBe(0);
  });
});

describe('calculateRascalScore - bonuses and butin', () => {
  const allBonuses = {
    card14Regular: 1,
    card14Black: 1,
    sirenCapturedByPirate: 1,
    pirateCapturedBySkullKing: 1,
    sirenCapturedSkullKing: 1,
    secondCaptured: 1,
    davyJonesCasketCount: 1,
    eightCardBonus: 1,
    sevenCardBonus: 1,
  };

  it('gives all base bonuses on a direct hit (extension ignored outside extension mode)', () => {
    // 10 + 20 + 20 + 30 + 40
    expect(calculateRascalScore(1, 1, 3, allBonuses).bonusScore).toBe(120);
  });

  it('adds extension bonuses on a direct hit in extension mode', () => {
    // 120 + 30 + 20 + 5 - 5
    expect(calculateRascalScore(1, 1, 3, allBonuses, false, true).bonusScore).toBe(170);
  });

  it('halves base and extension bonuses on a frappe à revers', () => {
    // 5 + 10 + 10 + 15 + 20 = 60, extension: 15 + 10 + 2 - 2 = 25
    expect(calculateRascalScore(1, 2, 3, allBonuses).bonusScore).toBe(60);
    expect(calculateRascalScore(1, 2, 3, allBonuses, false, true).bonusScore).toBe(85);
  });

  it('gives no bonus at all on an échec cuisant', () => {
    expect(calculateRascalScore(0, 3, 3, allBonuses, false, true).bonusScore).toBe(0);
  });

  const alliance = { treasureAlliance: [{ playedBy: 'a', wonBy: 'b' }] };

  it('gives the full butin on a direct hit when both players are correct', () => {
    const bets = { a: 1, b: 1 };
    expect(calculateRascalScore(1, 1, 3, alliance, false, false, 'a', bets, bets).bonusScore).toBe(20);
  });

  it('does not give the butin on a frappe à revers since the player missed the exact bet', () => {
    // Butin requires both exact bets; a frappe à revers means this player is off by one.
    expect(
      calculateRascalScore(1, 2, 3, alliance, false, false, 'a', { a: 1, b: 1 }, { a: 2, b: 1 }).bonusScore
    ).toBe(0);
  });

  it('applies bonuses on a boulet de canon direct hit', () => {
    const result = calculateRascalScore(2, 2, 4, { card14Black: 1 }, true);
    expect(result).toEqual({ miseScore: 60, bonusScore: 20, totalScore: 80 });
  });
});

describe('missing bonus values', () => {
  it('treats absent extension bonuses as zero in every scoring system', () => {
    expect(calculateSkullKingScore(1, 1, 3, {}, true).bonusScore).toBe(0);
    expect(calculateRascalScore(1, 1, 3, {}, false, true).bonusScore).toBe(0);
    expect(calculateRascalScore(1, 2, 3, {}, false, true).bonusScore).toBe(0);
  });

  it('accepts a successful zero bet from the player who won the butin', () => {
    expect(calculateTreasureAllianceBonus('b', [{ playedBy: 'a', wonBy: 'b' }], { a: 2, b: 0 }, { a: 2, b: 0 })).toBe(20);
  });
});
