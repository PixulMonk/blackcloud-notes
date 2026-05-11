import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  RemoveFormatting,
} from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface FormattingGroupProps {
  editor: Editor;
}

function FormattingGroup({ editor }: FormattingGroupProps) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      return {
        isBold: e.isActive('bold'),
        isItalic: e.isActive('italic'),
        isUnderline: e.isActive('underline'),
        isStrike: e.isActive('strike'),
        isSuperscript: e.isActive('superscript'),
        isSubscript: e.isActive('subscript'),
      };
    },
  });
  return (
    <>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleBold().run())}
        isActive={editorState?.isBold ?? false}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleItalic().run())}
        isActive={editorState?.isItalic ?? false}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleUnderline().run())}
        isActive={editorState?.isUnderline ?? false}
      >
        <Underline size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleStrike().run())}
        isActive={editorState?.isStrike ?? false}
      >
        <Strikethrough size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleSuperscript().run())}
        isActive={editorState?.isSuperscript ?? false}
      >
        <Superscript size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleSubscript().run())}
        isActive={editorState?.isSubscript ?? false}
      >
        <Subscript size={15} />
      </ToolbarButton>
    </>
  );
}

export default FormattingGroup;
