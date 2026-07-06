import { deriveKeysForNewUser, deriveKeysForLogin } from '@/lib/crypto/kdf';
import { vi } from 'vitest';

import { type Argon2Params } from '@blackcloud/shared';

// Mock hash-wasm since argon2id uses WebAssembly which doesn't run in jsdom
vi.mock('hash-wasm', () => ({
  argon2id: vi.fn(),
}));

import { argon2id } from 'hash-wasm';

describe('KDF Functions', () => {
  const mockDerived = new Uint8Array(64).fill(1); // 64 bytes — 32 KEK + 32 authToken

  beforeEach(() => {
    vi.clearAllMocks();
    (argon2id as ReturnType<typeof vi.fn>).mockResolvedValue(mockDerived);
  });

  describe('deriveKeysForNewUser', () => {
    let result: Awaited<ReturnType<typeof deriveKeysForNewUser>>;

    beforeEach(async () => {
      result = await deriveKeysForNewUser('masterPassword');
    });

    test('returns keyEncryptionKey of 32 bytes', () => {
      expect(result.keyEncryptionKey).toHaveLength(32);
    });

    test('returns authToken of 32 bytes', () => {
      expect(result.authToken).toHaveLength(32);
    });

    test('generates a random salt of 16 bytes', () => {
      expect(result.argon2Salt).toHaveLength(16);
    });

    test('returns argon2Params', () => {
      expect(result.argon2Params).toBeDefined();
    });

    test('calls argon2id with correct params', () => {
      expect(argon2id).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'masterPassword',
          outputType: 'binary',
        }),
      );
    });
  });

  describe('deriveKeysForLogin', () => {
    const mockPassword = 'masterPassword';
    const mockSalt = new Uint8Array(64).fill(2);
    const mockArgonParams = {
      memoryCost: 65536,
      timeCost: 2,
      parallelism: 4,
      hashLength: 64,
      type: 'argon2id',
    } satisfies Argon2Params;

    test('throws when unsupported KDF type is provided', async () => {
      const wrongParams = {
        memoryCost: 65536,
        timeCost: 2,
        parallelism: 4,
        hashLength: 64,
        type: 'unsupported-type',
      } as unknown as Argon2Params;

      await expect(
        deriveKeysForLogin(mockPassword, mockSalt, wrongParams),
      ).rejects.toThrow('Unsupported KDF type');
    });

    test('returns correct keyEncryptionKey and authToken', async () => {
      const result = await deriveKeysForLogin(
        mockPassword,
        mockSalt,
        mockArgonParams,
      );

      expect(result.keyEncryptionKey).toEqual(mockDerived.slice(0, 32));
      expect(result.authToken).toEqual(
        mockDerived.slice(32, mockDerived.length),
      );
    });
    test('calls argon2id with provided salt and params', async () => {
      await deriveKeysForLogin(mockPassword, mockSalt, mockArgonParams);

      expect(argon2id as ReturnType<typeof vi.fn>).toHaveBeenCalledWith({
        password: mockPassword,
        salt: mockSalt,
        parallelism: mockArgonParams.parallelism,
        iterations: mockArgonParams.timeCost,
        memorySize: mockArgonParams.memoryCost,
        hashLength: mockArgonParams.hashLength,
        outputType: 'binary',
      });
    });
  });
});
