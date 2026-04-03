import { create } from 'zustand';

interface VaultState {
  keyEncryptionKey?: Uint8Array | undefined;
  dataEncryptionKey?: Uint8Array | undefined;
  setKeys: (kek: Uint8Array, dek: Uint8Array) => void;
  clearKeys: () => void;
}

export const useVaultStore = create<VaultState>((set) => ({
  keyEncryptionKey: undefined,
  dataEncryptionKey: undefined,
  setKeys: (kek, dek) => set({ keyEncryptionKey: kek, dataEncryptionKey: dek }),
  clearKeys: () =>
    set((state) => {
      state.keyEncryptionKey?.fill(0);
      state.dataEncryptionKey?.fill(0);

      return {
        keyEncryptionKey: undefined,
        dataEncryptionKey: undefined,
      };
    }),
}));
