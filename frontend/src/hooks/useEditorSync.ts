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
    if (!editor || !selectedFileId || !dataEncryptionKey) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleUpdate = async () => {
      console.log('change detected');
      console.log('Syncing state:', isSyncing);

      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const contentJSON = editor.getJSON();
        console.log('encrypting...');

        setSyncing(true);

        const encryptedContent = await encryptAESGCM(
          JSON.stringify(contentJSON),
          dataEncryptionKey,
        );
        console.log('finished encrypting');
        console.log('sending update to backend...');
        await updateNote(encryptedContent, selectedFileId);
        console.log('update sent to backend');
      }, 1000);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      clearTimeout(timeout);
    };
  }, [editor, selectedFileId, dataEncryptionKey]);
};

export default useEditorSync;
