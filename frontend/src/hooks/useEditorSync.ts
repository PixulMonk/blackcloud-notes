import { useEffect } from 'react';

import { useData, useDataActions } from '@/store/useDataStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';
import { type Editor } from '@tiptap/react';
import { encryptAESGCM } from '@/lib/crypto/aes';

const useEditorSync = (
  editor: Editor | null,
  selectedFileId: string | null,
) => {
  const { isSyncing } = useData();
  const { setSyncing, updateNote } = useDataActions();

  const dataEncryptionKey = useDataEncryptionKey();

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
        const encryptedContent = await encryptAESGCM(
          JSON.stringify(contentJSON),
          dataEncryptionKey,
        );
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
