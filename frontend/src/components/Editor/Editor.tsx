import { useMemo } from 'react';
import { EditorContent, EditorContext } from '@tiptap/react';

import useEditorSetup from '@/hooks/useEditorSetup';
import useEditorContent from '@/hooks/useEditorContent';
import useEditorSync from '@/hooks/useEditorSync';
import { useTreeUI } from '@/store/useTreeUIStore';

import MenuBar from '../MenuBar';
import { SkeletonText } from './SkeletonText';

const formatDate = (iso?: string) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const Editor = () => {
  const { selectedFileId, selectedNode } = useTreeUI(); // grab full node
  const editor = useEditorSetup();
  const { showSkeleton, isFetchingContent } = useEditorContent(
    editor,
    selectedFileId,
  );
  useEditorSync(editor, selectedFileId);

  const providerValue = useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <div className="flex flex-col h-full">
        {/* Sticky toolbar */}
        {selectedFileId && !isFetchingContent && (
          <div className="sticky top-0 z-10 bg-background border-b border-border/50">
            <div className="max-w-3xl mx-auto px-8">
              <MenuBar editor={editor} />
            </div>
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Metadata row */}
            {selectedNode?.createdAt && (
              <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground">
                <span>
                  Created{' '}
                  <span className="text-foreground/70">
                    {formatDate(selectedNode.createdAt)}
                  </span>
                </span>
              </div>
            )}

            {/* Content */}
            {showSkeleton ? (
              <SkeletonText />
            ) : (
              <EditorContent
                editor={editor}
                className="prose dark:prose-invert max-w-full"
              />
            )}
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
};

export default Editor;
