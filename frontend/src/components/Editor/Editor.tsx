import { useMemo, useState } from 'react';
import { EditorContent, EditorContext } from '@tiptap/react';
import { PenLine } from 'lucide-react';

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
  const [isFocused, setIsFocused] = useState(false);
  const { showSkeleton, isFetchingContent, isContentReady } = useEditorContent(
    editor,
    selectedFileId,
  );

  useEditorSync(editor, selectedFileId);

  const isEmpty = !isFetchingContent && (editor?.isEmpty ?? true);

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
              <div
                className="relative group cursor-text"
                onClick={() => editor?.commands.focus()}
              >
                {isContentReady && isEmpty && !isFocused && (
                  <div className="absolute top-0 left-0 flex items-center gap-2 text-muted-foreground/40 pointer-events-none transition-colors group-hover:text-muted-foreground/60">
                    <PenLine size={13} />
                    <span className="text-sm">Start writing…</span>
                  </div>
                )}
                <EditorContent
                  editor={editor}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="prose dark:prose-invert max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </EditorContext.Provider>
  );
};

export default Editor;
