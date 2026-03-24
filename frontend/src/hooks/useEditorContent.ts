import { useState, useEffect } from 'react';
import { useDataStore } from '@/store/useDataStore';
import { type Editor } from '@tiptap/react';

const useEditorContent = (
  editor: Editor | null,
  selectedFileId: string | null,
) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const fetchNodeContent = useDataStore((state) => state.fetchNodeContent);
  const isFetchingContent = useDataStore((state) => state.isFetchingContent);

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

    fetchNodeContent(selectedFileId).then((content) => {
      if (!content) return;
      const raw = content.encryptedContent;
      if (!raw) return;
      const contentJSON = JSON.parse(raw);
      editor?.commands.setContent(contentJSON);
    });
  }, [selectedFileId, editor]);

  return { showSkeleton, isFetchingContent };
};

export default useEditorContent;
