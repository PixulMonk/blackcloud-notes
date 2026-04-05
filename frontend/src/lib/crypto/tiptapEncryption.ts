import { encryptAESGCM, decryptAESGCM } from './aes';

export const encryptTipTapContent = async (
  tipTapJSON: object,
  dek: Uint8Array,
) => {
  const plaintext = new TextEncoder().encode(JSON.stringify(tipTapJSON));
  return encryptAESGCM(plaintext, dek);
};

/**
 * Decrypt TipTap content from DB
 */
export const decryptTipTapContent = async (
  payload: { ciphertext: Uint8Array; authTag: Uint8Array; iv: Uint8Array },
  dek: Uint8Array,
) => {
  const decrypted = await decryptAESGCM(
    payload.ciphertext,
    payload.authTag,
    dek,
    payload.iv,
  );
  const jsonString = new TextDecoder().decode(decrypted);
  return JSON.parse(jsonString);
};
