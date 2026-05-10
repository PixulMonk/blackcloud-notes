import type { Editor } from '@tiptap/core';
import { Undo2, Redo2 } from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface UndoRedoGroupProps {
  editor: Editor;
}

function UndoRedoGroup({ editor }: UndoRedoGroupProps) {
  return (
    <>
      <ToolbarButton onClick={run(() => editor.chain().focus().undo().run())}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={run(() => editor.chain().focus().redo().run())}>
        <Redo2 size={15} />
      </ToolbarButton>
    </>
  );
}

export default UndoRedoGroup;
