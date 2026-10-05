import {
  calculateIncrementalScore,
  calculateRascalScore,
  calculateSkullKingScore,
  calculateTreasureAllianceBonus,
  DEFAULT_CARDS_PER_ROUND,
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
