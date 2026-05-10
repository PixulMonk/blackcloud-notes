import type { Editor } from '@tiptap/core';
import { BetweenHorizonalEnd } from 'lucide-react';

import ToolbarDropdown from '../ToolbarDropdown';
import { run } from './toolbarUtils';
import { useEditorState } from '@tiptap/react';

interface SpacerGroupProps {
  editor: Editor;
}

function SpacerGroup({ editor }: SpacerGroupProps) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      const lineHeight =
        e.getAttributes('paragraph').lineHeight ??
        e.getAttributes('heading').lineHeight ??
        '';

      return {
        lineHeight,
      };
    },
  });

  const currentLineHeight = editorState?.lineHeight ?? '1.5';
  return (
    <>
      <ToolbarDropdown
        currentValue={currentLineHeight}
        icon={<BetweenHorizonalEnd size={15} />}
        items={[
          {
            label: 'Single (1.0)',
            value: '1',
            onSelect: () => editor.chain().focus().setLineHeight('1.0').run(),
          },
          {
            label: 'Default (1.5)',
            value: '1.5',
            onSelect: () => editor.chain().focus().setLineHeight('1.5').run(),
          },
          {
            label: 'Double (2.0)',
            value: '2.0',
            onSelect: () => editor.chain().focus().setLineHeight('2.0').run(),
          },
          {
            label: 'Unset Line Height',
            value: '',
            onSelect: () => editor.chain().focus().unsetLineHeight().run(),
          },
        ]}
      />
    </>
  );
}

export default SpacerGroup;
