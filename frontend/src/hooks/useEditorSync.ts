import { useEffect } from 'react';

import { useDataStore } from '@/store/useDataStore';
import { useVaultStore } from '@/store/useVaultStore';
import { type Editor } from '@tiptap/react';
import { encryptTipTapContent } from '@/lib/crypto/tiptapEncryption';
import { toBase64 } from '@/lib/crypto/crypto-utils';

const useEditorSync = (
  editor: Editor | null,
  selectedFileId: string | null,
) => {
  const isSyncing = useDataStore((state) => state.isSyncing);
  const setSyncing = useDataStore((state) => state.setSyncing);
  const updateNote = useDataStore((state) => state.updateNote);
  const dataEncryptionKey = useVaultStore((state) => state.dataEncryptionKey);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSyncing) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSyncing]);

  useEffect(() => {
    if (!editor) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleUpdate = async () => {
      setSyncing(true);
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const contentJSON = editor.getJSON();
        const isEmpty = editor.isEmpty;
        if (isEmpty) return;

        if (!dataEncryptionKey) return;

        // Encrypt the content
        const encrypted = await encryptTipTapContent(
          contentJSON,
          dataEncryptionKey,
        );

        // Convert to base64
        const encryptedContent = {
          ciphertext: toBase64(encrypted.ciphertext),
          authTag: toBase64(encrypted.authTag),
          iv: toBase64(encrypted.iv),
        };

        //
        updateNote(encryptedContent, selectedFileId!);
      }, 1000);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(timeout);
    };
  }, [editor, selectedFileId]);
};

export default useEditorSync;
