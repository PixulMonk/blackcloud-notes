import { create } from 'zustand';

interface VaultState {
  keyEncryptionKey?: Uint8Array;
  dataEncryptionKey?: Uint8Array;
  setKeys: (kek: Uint8Array, dek: Uint8Array) => void;
  clearKeys: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  keyEncryptionKey: undefined,
  dataEncryptionKey: undefined,
  setKeys: (kek, dek) => set({ keyEncryptionKey: kek, dataEncryptionKey: dek }),
  clearKeys: () =>
    set({ keyEncryptionKey: undefined, dataEncryptionKey: undefined }),
}));
