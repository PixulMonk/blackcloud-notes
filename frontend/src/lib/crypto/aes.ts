import { fromBase64, toBase64 } from './crypto-utils';

const TAG_LENGTH = 16;

export const encryptAESGCM = async (
  plaintext: string | Uint8Array,
  keyBytes: Uint8Array,
): Promise<string> => {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); //96-bits

    const data =
      typeof plaintext === 'string'
        ? new TextEncoder().encode(plaintext)
        : plaintext;

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      'AES-GCM',
      false,
      ['encrypt'],
    );

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128,
      },
      key,
      data as BufferSource,
    );

    const encrypted = new Uint8Array(encryptedBuffer);

    // Combine encrypted with IV in order to get IV ‖ ciphertext ‖ tag
    const combined = new Uint8Array(iv.length + encrypted.length);
    combined.set(iv);
    combined.set(encrypted, iv.length);

    return toBase64(combined); // base64
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

// Decrypting to string: notes, titles, etc.
export const decryptAESGCM = async (
  payload: string, //base64
  keyBytes: Uint8Array,
): Promise<string> => {
  try {
    const payloadBytes = fromBase64(payload);
    if (payloadBytes.length < 12 + 16) {
      throw new Error('Invalid payload length');
    }

    const iv = payloadBytes.slice(0, 12);
    if (iv.length !== 12) {
      throw new Error('Invalid IV length');
    }
    const encrypted = payloadBytes.slice(12);

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      'AES-GCM',
      false,
      ['decrypt'],
    );

    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: 128,
      },
      key,
      encrypted as BufferSource,
    );

    const decoder = new TextDecoder();
    const decodedPlaintext = decoder.decode(plaintext);

    return decodedPlaintext;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed (invalid key or corrupted data)');
  }
};

// Decrypting to bytes (DEKs, binary data, etc.)
export const decryptAESGCMBytes = async (
  payload: string,
  keyBytes: Uint8Array,
): Promise<Uint8Array> => {
  const payloadBytes = fromBase64(payload);

  if (payloadBytes.length < 12 + 16) {
    throw new Error('Invalid payload length');
  }

  const iv = payloadBytes.slice(0, 12);
  const encrypted = payloadBytes.slice(12);

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes as BufferSource,
    'AES-GCM',
    false,
    ['decrypt'],
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted,
  );

  return new Uint8Array(decryptedBuffer);
};
