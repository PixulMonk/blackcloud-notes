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
  const [isContentReady, setIsContentReady] = useState(false);

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

    setIsContentReady(false); // reset on note switch
    editor?.commands.clearContent();

    fetchNodeContent(selectedFileId).then(async (content) => {
      if (!content || !content.encryptedContent || !dataEncryptionKey) {
        setIsContentReady(true); // genuinely empty note
        return;
      }

      const decryptedDataString = await decryptAESGCM(
        content.encryptedContent,
        dataEncryptionKey,
      );
      const jsonContent = JSON.parse(decryptedDataString);
      editor?.commands.setContent(jsonContent);
      setIsContentReady(true); // content is set
    });
  }, [selectedFileId, editor]);

  return { showSkeleton, isFetchingContent, isContentReady };
};

export default useEditorContent;
