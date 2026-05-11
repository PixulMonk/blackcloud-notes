import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface AlignmentGroupProps {
  editor: Editor;
}

function AlignmentGroup({ editor }: AlignmentGroupProps) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      return {
        isLeftAligned:
          e.isActive({ textAlign: 'left' }) ||
          (!e.isActive({ textAlign: 'center' }) &&
            !e.isActive({ textAlign: 'right' }) &&
            !e.isActive({ textAlign: 'justify' })),
        isCenterAligned: e.isActive({ textAlign: 'center' }),
        isRightAligned: e.isActive({ textAlign: 'right' }),
        isJustifyAligned: e.isActive({ textAlign: 'justify' }),
      };
    },
  });
  return (
    <>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().setTextAlign('left').run())}
        isActive={editorState?.isLeftAligned ?? false}
      >
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().setTextAlign('center').run())}
        isActive={editorState?.isCenterAligned ?? false}
      >
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().setTextAlign('right').run())}
        isActive={editorState?.isRightAligned ?? false}
      >
        <AlignRight size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() =>
          editor.chain().focus().setTextAlign('justify').run(),
        )}
        isActive={editorState?.isJustifyAligned ?? false}
      >
        <AlignJustify size={15} />
      </ToolbarButton>
    </>
  );
}

export default AlignmentGroup;
