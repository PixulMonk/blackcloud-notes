import { useState, useMemo, useEffect } from 'react';

import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list';

import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import MenuBar from './MenuBar';

import { useTreeUIStore } from '@/store/useTreeUIStore';
import { useDataStore } from '@/store/useDataStore';

const Editor = () => {
  const [editorContent, setEditorContent] = useState('');
  const selectedFileId = useTreeUIStore((state) => state.selectedFileId);
  const fetchNodeContent = useDataStore((state) => state.fetchNodeContent);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      BulletList,
      ListItem,
      OrderedList,
    ],
    content: editorContent,
  });

  useEffect(() => {
    if (!selectedFileId) return;

    fetchNodeContent(selectedFileId).then((content) => {
      if (!content) return;
      const text = content.encryptedContent || '';
      setEditorContent(text);

      if (editor) {
        editor.commands.setContent(text);
      }
    });
  }, [selectedFileId, editor]);

  // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <div className="mx-5 my-15">
      <EditorContext.Provider value={providerValue}>
        <div className="flex flex-col gap-5 item">
          <MenuBar editor={editor} />
          <EditorContent
            editor={editor}
            className="prose dark:prose-invert max-w-full p-2"
          />
        </div>

        {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
