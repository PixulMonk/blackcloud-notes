import {
  encryptAESGCM,
  decryptAESGCM,
  decryptAESGCMBytes,
} from '@/lib/crypto/aes';

import { toBase64 } from '@/lib/crypto/crypto-utils';

describe('AES-GCM Encrypt Functions', () => {
  const mockKey = new Uint8Array(32).fill(1); // 32 bytes of 0x01

  describe('encryptAESGCM', () => {
    test('returns a base64 string', async () => {});

    test('different calls produce different ciphertext (random IV)', async () => {});

    test('round trip with decryptAESGCM returns original string', async () => {
      const mockText = 'Sample plaintext string';

      const encryptedBlob = await encryptAESGCM(mockText, mockKey);

      expect(decryptAESGCM(encryptedBlob, mockKey)).toBe(mockText);
    });
  });

  describe('decryptAESGCM', () => {
    test('throws on payload too short', async () => {});

    test('throws on wrong key', async () => {});

    test('round trip returns original plaintext', async () => {});
  });

  describe('decryptAESGCMBytes', () => {
    test('round trip returns original bytes', async () => {});

    test('throws on payload too short', async () => {});
  });
});
