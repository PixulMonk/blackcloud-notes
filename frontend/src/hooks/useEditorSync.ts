import { useEffect } from 'react';

import { useDataStore } from '@/store/useDataStore';
import { type Editor } from '@tiptap/react';

const useEditorSync = (
  editor: Editor | null,
  selectedFileId: string | null,
) => {
  const isSyncing = useDataStore((state) => state.isSyncing);
  const setSyncing = useDataStore((state) => state.setSyncing);
  const updateNote = useDataStore((state) => state.updateNote);

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

    const handleUpdate = () => {
      setSyncing(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const contentJSON = editor.getJSON();
        const isEmpty = editor.isEmpty;
        if (isEmpty) return;

        updateNote(
          undefined,
          JSON.stringify(contentJSON),
          undefined,
          selectedFileId!,
        );
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
