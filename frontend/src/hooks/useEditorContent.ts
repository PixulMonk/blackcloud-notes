import { useState, useEffect } from 'react';
import { type Editor } from '@tiptap/react';

import { useDataStore } from '@/store/useDataStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';
import { decryptTipTapContent } from '@/lib/crypto/tiptapEncryption';
import { fromBase64 } from '@/lib/crypto/crypto-utils';

const useEditorContent = (
  editor: Editor | null,
  selectedFileId: string | null,
) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const fetchNodeContent = useDataStore((state) => state.fetchNodeContent);
  const isFetchingContent = useDataStore((state) => state.isFetchingContent);
  const dataEncryptionKey = useDataEncryptionKey();

  useEffect(() => {
    if (!isFetchingContent) {
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

      // Convert base64 to Uint8Array
      const payload = {
        ciphertext: fromBase64(content.encryptedContent.ciphertext),
        authTag: fromBase64(content.encryptedContent.authTag),
        iv: fromBase64(content.encryptedContent.iv),
      };

      // Decrypt
      const decryptedTipTapJSON = await decryptTipTapContent(
        payload,
        dataEncryptionKey,
      );

      // Set editor content
      editor?.commands.setContent(decryptedTipTapJSON);
    });
  }, [selectedFileId, editor]);

  return { showSkeleton, isFetchingContent };
};

export default useEditorContent;
