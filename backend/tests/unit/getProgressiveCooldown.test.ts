import { getProgressiveCooldown } from '../../src/utils/cooldownHelpers';

describe('Get Progresive Cooldown Utility Function', () => {
  test('cooldown increases with each attempt', () => {
    expect(getProgressiveCooldown(1)).toBeGreaterThan(
      getProgressiveCooldown(0),
    );
    expect(getProgressiveCooldown(2)).toBeGreaterThan(
      getProgressiveCooldown(1),
    );
    expect(getProgressiveCooldown(3)).toBeGreaterThan(
      getProgressiveCooldown(2),
    );
  });
});
