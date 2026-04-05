const TAG_LENGTH = 16;

export const encryptAESGCM = async (
  plaintext: Uint8Array,
  keyBytes: Uint8Array,
) => {
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); //96-bits

    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      'AES-GCM',
      false,
      ['encrypt'],
    );

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: 128,
      },
      key,
      plaintext as BufferSource,
    );

    const result = new Uint8Array(encrypted);

    return {
      ciphertext: result.slice(0, result.length - TAG_LENGTH),
      authTag: result.slice(result.length - TAG_LENGTH),
      iv,
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
};

export const decryptAESGCM = async (
  ciphertext: Uint8Array,
  authTag: Uint8Array,
  keyBytes: Uint8Array,
  iv: Uint8Array,
) => {
  if (iv.length !== 12) {
    throw new Error('Invalid IV length');
  }

  if (authTag.length !== TAG_LENGTH) {
    throw new Error('Invalid authTag length');
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyBytes as BufferSource,
      'AES-GCM',
      false,
      ['decrypt'],
    );

    const combined = new Uint8Array(ciphertext.length + authTag.length);
    combined.set(ciphertext);
    combined.set(authTag, ciphertext.length);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: 128,
      },
      key,
      combined,
    );

    return new Uint8Array(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed (invalid key or corrupted data)');
  }
};
