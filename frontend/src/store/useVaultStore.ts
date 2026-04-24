import { create } from 'zustand';

import type { VaultActions, VaultState } from '@/types/vault.types';

const useVaultStore = create<VaultState>((set) => ({
  keyEncryptionKey: undefined,
  dataEncryptionKey: undefined,
  actions: {
    setKeys: (kek, dek) =>
      set({ keyEncryptionKey: kek, dataEncryptionKey: dek }),
    clearKeys: () =>
      set((state) => {
        // Manually zero out the sensitive data in memory before clearing the reference
        if (state.keyEncryptionKey) state.keyEncryptionKey.fill(0);
        if (state.dataEncryptionKey) state.dataEncryptionKey.fill(0);

        return {
          keyEncryptionKey: undefined,
          dataEncryptionKey: undefined,
        };
      }),
  },
}));

export const useKeyEncryptionKey = () =>
  useVaultStore((s) => s.keyEncryptionKey);
export const useDataEncryptionKey = () =>
  useVaultStore((s) => s.dataEncryptionKey);
export const useVaultActions = (): VaultActions =>
  useVaultStore((s) => s.actions);
