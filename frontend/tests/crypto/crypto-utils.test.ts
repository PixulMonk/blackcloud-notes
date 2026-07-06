import { toBase64, fromBase64 } from '@/lib/crypto/crypto-utils';

describe('Crypto Utility Functions', () => {
  describe('toBase64', () => {
    const mockBytes = new Uint8Array(64).fill(1);

    test('returns a base64 string', () => {
      const result = toBase64(mockBytes);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });
    test('round trip with fromBase64 returns original bytes', () => {
      const encoded = toBase64(mockBytes);
      const decoded = fromBase64(encoded);

      expect(decoded).toEqual(mockBytes);
    });
  });

  describe('fromBase64', () => {
    const mockBase64String = btoa('Hello, World!');

    test('returns a Uint8Array', () => {
      const result = fromBase64(mockBase64String);

      expect(result instanceof Uint8Array).toBe(true);
    });
    test('round trip with toBase64 returns original bytes', () => {
      const decoded = fromBase64(mockBase64String);
      const encoded = toBase64(decoded);

      expect(encoded).toEqual(mockBase64String);
    });
    test('handles empty input', () => {
      const result = fromBase64('');
      expect(result).toEqual(new Uint8Array(0));
    });
  });
});
