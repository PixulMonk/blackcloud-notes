import type { Editor } from '@tiptap/core';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
} from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface FormattingGroupProps {
  editor: Editor;
}

function FormattingGroup({ editor }: FormattingGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleBold().run())}
        isActive={editor.isActive('bold')}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleItalic().run())}
        isActive={editor.isActive('italic')}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleUnderline().run())}
        isActive={editor.isActive('underline')}
      >
        <Underline size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleStrike().run())}
        isActive={editor.isActive('strike')}
      >
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleSuperscript().run())}
        isActive={editor.isActive('superscript')}
      >
        <Superscript size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleSubscript().run())}
        isActive={editor.isActive('subscript')}
      >
        <Subscript size={15} />
      </ToolbarButton>
      {/* TODO: erase formatting button */}
    </>
  );
}

export default FormattingGroup;
