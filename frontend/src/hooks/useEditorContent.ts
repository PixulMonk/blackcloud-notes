import { useState, useEffect } from "react";
import { type Editor } from "@tiptap/react";

import { useData, useDataActions } from "@/store/useDataStore";
import { useDataEncryptionKey } from "@/store/useVaultStore";
import { decryptAESGCM } from "@/lib/crypto/aes";

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
    if (!selectedFileId || !editor || editor.isDestroyed) return;

    let cancelled = false;
    setIsContentReady(false);
    editor.commands.clearContent();

    const loadContent = async () => {
      try {
        const content = await fetchNodeContent(selectedFileId);
        if (cancelled || editor.isDestroyed) return;

        if (!content?.encryptedContent) {
          setIsContentReady(true);
          return;
        }

        // Wait for the key; the effect will retry when it becomes available.
        if (!dataEncryptionKey) return;

        const decrypted = await decryptAESGCM(
          content.encryptedContent,
          dataEncryptionKey,
        );
        if (cancelled || editor.isDestroyed) return;

        editor.commands.setContent(JSON.parse(decrypted));
        setIsContentReady(true);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load note content:", error);
          setIsContentReady(true);
        }
      }
    };

    void loadContent();
    return () => {
      cancelled = true;
    };
  }, [selectedFileId, editor, fetchNodeContent, dataEncryptionKey]);

  return { showSkeleton, isFetchingContent, isContentReady };
};

export default useEditorContent;
