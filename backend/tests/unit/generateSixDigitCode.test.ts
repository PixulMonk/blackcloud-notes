import { generateSixDigitCode } from './../../src/utils/generateVerificationCode';

describe('Generate Six Digit Code Unit Test', () => {
  describe('number of digits', () => {
    test('returned int should be six digits', () => {
      const result = generateSixDigitCode();
      expect(String(result)).toHaveLength(6);
    });
  });

  describe('length', () => {
    test('returned int is between 100000 and 999999', () => {
      const result = generateSixDigitCode();
      expect(result).toBeGreaterThanOrEqual(100000);
      expect(result).toBeLessThanOrEqual(999999);
    });
  });
});
