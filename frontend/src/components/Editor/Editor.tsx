import { useMemo } from 'react';
import { EditorContent, EditorContext } from '@tiptap/react';

import useEditorSetup from '@/hooks/useEditorSetup';
import useEditorContent from '@/hooks/useEditorContent';
import useEditorSync from '@/hooks/useEditorSync';
import { useTreeUI } from '@/store/useTreeUIStore';

import MenuBar from '../MenuBar';
import { SkeletonText } from './SkeletonText';

const Editor = () => {
  const { selectedFileId } = useTreeUI();
  const editor = useEditorSetup();
  const { showSkeleton, isFetchingContent } = useEditorContent(
    editor,
    selectedFileId,
  );
  useEditorSync(editor, selectedFileId);

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
