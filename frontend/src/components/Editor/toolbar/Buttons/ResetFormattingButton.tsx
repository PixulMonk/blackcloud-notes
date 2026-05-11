import type { Editor } from '@tiptap/core';

import { RemoveFormatting } from 'lucide-react';

import { ToolbarButton } from '../ToolBarPrimitives';
import { run } from '../toolbarUtils';

interface ResetFormattingButtonProps {
  editor: Editor;
}

function ResetFormattingButton({ editor }: ResetFormattingButtonProps) {
  return (
    <>
      <ToolbarButton
        onClick={run(() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run(),
        )}
      >
        <RemoveFormatting size={15} />
      </ToolbarButton>
    </>
  );
}

export default ResetFormattingButton;
