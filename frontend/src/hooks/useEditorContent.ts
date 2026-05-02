import { useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';

import { useData, useDataActions } from '@/store/useDataStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';
import { decryptAESGCM } from '@/lib/crypto/aes';

const useEditorContent = (
  editor: Editor | null,
  selectedFileId: string | null,
) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const { isFetchingContent } = useData();
  const { fetchNodeContent } = useDataActions();
  const dataEncryptionKey = useDataEncryptionKey();

  useEffect(() => {
    if (!isFetchingContent) {
      setShowSkeleton(false);
      return;
    }
    const timeout = setTimeout(() => setShowSkeleton(true), 200);
    return () => clearTimeout(timeout);
  }, [isFetchingContent]);

  useEffect(() => {
    if (!selectedFileId) return;

    editor?.commands.clearContent();

    fetchNodeContent(selectedFileId).then(async (content) => {
      if (!content || !content.encryptedContent || !dataEncryptionKey) return;

      // Decrypt
      const decryptedDataString = await decryptAESGCM(
        content.encryptedContent,
        dataEncryptionKey,
      );

      const jsonContent = JSON.parse(decryptedDataString);

      // Set editor content
      editor?.commands.setContent(jsonContent);
    });
  }, [selectedFileId, editor]);

  return { showSkeleton, isFetchingContent };
};

export default useEditorContent;
