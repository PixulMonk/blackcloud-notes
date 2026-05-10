import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import { Type, Highlighter } from 'lucide-react';

import ColourDropdown from '../ColourDropdown';
import { run } from './toolbarUtils';

interface ColourGroupProps {
  editor: Editor;
}

function ColourGroup({ editor }: ColourGroupProps) {
  // fix: colon not closing paren
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      return {
        fontColor: e.getAttributes('textStyle').color ?? null,
        highlightColor: e.getAttributes('highlight').color ?? null,
      };
    },
  });

  const currentFontColor = editorState?.fontColor ?? null;
  const currentHighlightColor = editorState?.highlightColor ?? null;
  const iconSize = 12;

  return (
    <>
      <ColourDropdown
        icon={<Type size={iconSize} />}
        currentHexValue={currentFontColor}
        onColorSelect={(hex) => editor.chain().focus().setColor(hex).run()}
        onClear={() => editor.chain().focus().unsetColor().run()}
      />
      <ColourDropdown
        icon={<Highlighter size={iconSize} />}
        currentHexValue={currentHighlightColor}
        onColorSelect={(hex) =>
          editor.chain().focus().setHighlight({ color: hex }).run()
        }
        onClear={() => editor.chain().focus().unsetHighlight().run()}
      />
    </>
  );
}

export default ColourGroup;
