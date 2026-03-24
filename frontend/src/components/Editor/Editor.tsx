import { useState, useMemo, useEffect } from 'react';

import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';

import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import MenuBar from '../MenuBar';

import { useTreeUIStore } from '@/store/useTreeUIStore';
import { useDataStore } from '@/store/useDataStore';

import { SkeletonText } from './SkeletonText';

// TODO: This entire component is an eyesore. Needs refactoring and separation later

const Editor = () => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const selectedFileId = useTreeUIStore((state) => state.selectedFileId);
  const fetchNodeContent = useDataStore((state) => state.fetchNodeContent);
  const isFetchingContent = useDataStore((state) => state.isFetchingContent);
  const isSyncing = useDataStore((state) => state.isSyncing);
  const setSyncing = useDataStore((state) => state.setSyncing);
  const updateNote = useDataStore((state) => state.updateNote);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
    ],
    content: '',
  });

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

    fetchNodeContent(selectedFileId).then((content) => {
      if (!content) return;
      const raw = content.encryptedContent;
      if (!raw) return;
      const contentJSON = JSON.parse(raw);
      editor?.commands.setContent(contentJSON);
    });
  }, [selectedFileId, editor]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSyncing) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSyncing]);

  // Listen for content changes (updates)
  useEffect(() => {
    if (!editor) return;

    let timeout: ReturnType<typeof setTimeout>;

    const handleUpdate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const contentJSON = editor.getJSON();
        const isEmpty = editor.isEmpty;
        if (isEmpty) return;

        // NOTE: had to stringify contentJSON as a shortcut (to avoid changing the types)
        // Since we don't have the encryption feature yet, what is being stored in the DB is the
        // TipTap JSON. Once the encryption feature takes place this is NOT what's going to get
        // stored in the DB. Instead the TipTap JSON will get stringified which will then
        // be encrypted BEFORE getting stored in the DB. The reverse will happen for decryption
        setSyncing(true);
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

  // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <div className="mx-5 my-15">
      <EditorContext.Provider value={providerValue}>
        <div className="flex flex-col gap-5 item">
          {selectedFileId && !isFetchingContent ? (
            <MenuBar editor={editor} />
          ) : null}

          {showSkeleton ? (
            <SkeletonText />
          ) : (
            <EditorContent
              editor={editor}
              className="prose dark:prose-invert max-w-full p-2"
            />
          )}
        </div>
        {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
