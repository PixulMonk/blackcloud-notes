import type { Editor } from '@tiptap/core';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface AlignmentGroupProps {
  editor: Editor;
}

function AlignmentGroup({ editor }: AlignmentGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().setTextAlign('left').run())}
        isActive={editor.isActive({ textAlign: 'left' })}
      >
        <AlignLeft size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().setTextAlign('center').run())}
        isActive={editor.isActive({ textAlign: 'center' })}
      >
        <AlignCenter size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().setTextAlign('right').run())}
        isActive={editor.isActive({ textAlign: 'right' })}
      >
        <AlignRight size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() =>
          editor.chain().focus().setTextAlign('justify').run(),
        )}
        isActive={editor.isActive({ textAlign: 'justify' })}
      >
        <AlignJustify size={15} />
      </ToolbarButton>
    </>
  );
}

export default AlignmentGroup;
