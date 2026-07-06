import { initializeUserVault } from './../../src/lib/crypto/vault';
import { encryptAESGCM } from '@/lib/crypto/aes';

vi.mock('@/lib/crypto/aes', () => ({
  encryptAESGCM: vi.fn(),
}));

describe('Vault Functions', () => {
  describe('initializeUserVault', () => {
    let result: Awaited<ReturnType<typeof initializeUserVault>>;

    const mockKEK = new Uint8Array(32).fill(1);

    beforeEach(async () => {
      (encryptAESGCM as ReturnType<typeof vi.fn>).mockResolvedValue(
        'base64encodedDEK==',
      );

      result = await initializeUserVault(mockKEK);
    });
    // Maybe be more broad? Like if KEK is incorrect length?
    test('throws when KEK length is not 32 bytes', async () => {
      const shortKEK = new Uint8Array(16).fill(1); // 16 bytes, not 32
      await expect(initializeUserVault(shortKEK)).rejects.toThrow(
        'Invalid KEK length',
      );
    });

    test('returns protectedDEK as a base64 string', async () => {
      expect(typeof result.protectedDEK).toBe('string');
      expect(result.protectedDEK).toMatch(/^[A-Za-z0-9+/]+=*$/);
    });

    test('returns argon2Params', () => {
      expect(result.argon2Params).toHaveProperty('memoryCost');
      expect(result.argon2Params).toHaveProperty('timeCost');
      expect(result.argon2Params).toHaveProperty('type', 'argon2id');
    });

    test('returns schemaVersion', async () => {
      expect(result.schemaVersion).toBeDefined();
    });

    test('returns rawDEK of 32 bytes', async () => {
      expect(result.rawDEK.length).toEqual(32);
    });

    test('rawDEK is different from protectedDEK (not storing plaintext)', async () => {
      expect(result.protectedDEK).not.toEqual(result.rawDEK);
    });
  });
});
