import {
  encryptAESGCM,
  decryptAESGCM,
  decryptAESGCMBytes,
} from '@/lib/crypto/aes';

describe('AES-GCM Crypto Functions', () => {
  const mockKey = new Uint8Array(32).fill(1); // 32 bytes of 0x01

  beforeEach(() => {
    // Added this here to silence the decryption errors (which are intentional)
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('encryptAESGCM', () => {
    test('returns a base64 string', async () => {
      const mockText = 'Sample plaintext string';
      const result = await encryptAESGCM(mockText, mockKey);

      expect(typeof result).toBe('string');
      expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    test('different calls produce different ciphertext (random IV)', async () => {
      const mockText = 'Sample plaintext string';
      const cipher1 = await encryptAESGCM(mockText, mockKey);
      const cipher2 = await encryptAESGCM(mockText, mockKey);

      expect(cipher1).not.toBe(cipher2);
    });

    test('round trip with decryptAESGCM returns original string', async () => {
      const mockText = 'Sample plaintext string';
      const encryptedBlob = await encryptAESGCM(mockText, mockKey);
      const decryptedText = await decryptAESGCM(encryptedBlob, mockKey);

      expect(decryptedText).toBe(mockText);
    });
  });

  describe('decryptAESGCM', () => {
    test('throws on payload too short', async () => {
      const tooShort = new Uint8Array(10); // 10 bytes, less than 12 + 16 minimum
      const tooShortBase64 = btoa(String.fromCharCode(...tooShort));

      await expect(decryptAESGCM(tooShortBase64, mockKey)).rejects.toThrow();
    });

    test('throws on wrong key', async () => {
      const wrongKey = new Uint8Array(32).fill(2);
      const mockText = 'Sample plaintext string';
      const encryptedBlob = await encryptAESGCM(mockText, mockKey);

      await expect(decryptAESGCM(encryptedBlob, wrongKey)).rejects.toThrow(
        'Decryption failed (invalid key or corrupted data)',
      );
    });
  });

  describe('decryptAESGCMBytes', () => {
    test('round trip returns original bytes', async () => {
      const mockBytes = new Uint8Array(32).fill(42); // 32 bytes of 0x2A
      const encryptedBlob = await encryptAESGCM(mockBytes, mockKey);
      const decryptedBytes = await decryptAESGCMBytes(encryptedBlob, mockKey);

      expect(decryptedBytes).toEqual(mockBytes);
    });

    test('throws on payload too short', async () => {
      const tooShort = new Uint8Array(10); // 10 bytes, less than 12 + 16 minimum
      const tooShortBase64 = btoa(String.fromCharCode(...tooShort));

      await expect(
        decryptAESGCMBytes(tooShortBase64, mockKey),
      ).rejects.toThrow();
    });
  });
});
