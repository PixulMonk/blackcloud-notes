export interface VaultActions {
  setKeys: (kek: Uint8Array, dek: Uint8Array) => void;
  clearKeys: () => void;
}

export interface VaultState {
  keyEncryptionKey: Uint8Array | undefined;
  dataEncryptionKey: Uint8Array | undefined;
  actions: VaultActions;
}
