import { useMemo } from 'react';

import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import { useEditor, EditorContent, EditorContext } from '@tiptap/react';
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';

import MenuBar from './MenuBar';

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
    ], // define your extension array
    content: '<p>Hello World!</p>', // initial content
  });

  // Memoize the provider value to avoid unnecessary re-renders
  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <div className="mx-5 my-15">
      <EditorContext.Provider value={providerValue}>
        <div className="flex flex-col gap-5">
          <MenuBar editor={editor} />
          <EditorContent editor={editor} className="prose max-w-full p-2" />
        </div>

        {/* <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu> */}
      </EditorContext.Provider>
    </div>
  );
};

export default Editor;
