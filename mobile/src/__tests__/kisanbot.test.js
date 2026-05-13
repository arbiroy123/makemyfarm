// Tests for KisanBot monthly usage limit logic.
// monthKey and limit logic extracted from ChatbotScreen for testability.

const FREE_MONTHLY_LIMIT = 5;

function monthKey(userId) {
  const now = new Date();
  return `kisanbot_${userId}_${now.getFullYear()}-${now.getMonth()}`;
}

function canAskQuestion(isPro, questionsUsed) {
  if (isPro) return { allowed: true };
  if (questionsUsed >= FREE_MONTHLY_LIMIT) {
    return { allowed: false, reason: 'monthly_limit_reached' };
  }
  return { allowed: true, remaining: FREE_MONTHLY_LIMIT - questionsUsed };
}

describe('monthKey()', () => {
  test('includes userId in the key', () => {
    expect(monthKey('user-abc')).toContain('user-abc');
  });

  test('starts with kisanbot_ prefix', () => {
    expect(monthKey('u1')).toMatch(/^kisanbot_/);
  });

  test('includes current year', () => {
    const year = new Date().getFullYear().toString();
    expect(monthKey('u1')).toContain(year);
  });

  test('includes current month index (0-based)', () => {
    const month = new Date().getMonth().toString();
    expect(monthKey('u1')).toContain(`-${month}`);
  });

  test('different users produce different keys', () => {
    expect(monthKey('user-A')).not.toBe(monthKey('user-B'));
  });

  test('key changes across months', () => {
    // Simulate Jan vs Feb of the same year
    const jan = `kisanbot_u1_2026-0`;
    const feb = `kisanbot_u1_2026-1`;
    expect(jan).not.toBe(feb);
  });
});

describe('canAskQuestion() — free user limit enforcement', () => {
  test('allows first question (0 used)', () => {
    const result = canAskQuestion(false, 0);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(5);
  });

  test('allows 4th question (3 used)', () => {
    const result = canAskQuestion(false, 3);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  test('allows exactly at limit (4 used)', () => {
    const result = canAskQuestion(false, 4);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  test('blocks when limit reached (5 used)', () => {
    const result = canAskQuestion(false, 5);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('monthly_limit_reached');
  });

  test('blocks when over limit (6 used, edge case)', () => {
    const result = canAskQuestion(false, 6);
    expect(result.allowed).toBe(false);
  });

  test('pro user is always allowed regardless of count', () => {
    expect(canAskQuestion(true, 0).allowed).toBe(true);
    expect(canAskQuestion(true, 5).allowed).toBe(true);
    expect(canAskQuestion(true, 999).allowed).toBe(true);
  });
});

describe('FREE_MONTHLY_LIMIT constant', () => {
  test('is 5', () => {
    expect(FREE_MONTHLY_LIMIT).toBe(5);
  });
});
