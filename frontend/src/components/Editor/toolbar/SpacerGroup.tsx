import type { Editor } from '@tiptap/core';
import { BetweenHorizonalEnd } from 'lucide-react';

import ToolbarDropdown from '../ToolbarDropdown';
import { useEditorState } from '@tiptap/react';

interface SpacerGroupProps {
  editor: Editor;
}

function SpacerGroup({ editor }: SpacerGroupProps) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      // TipTap V3's LineHeight extension applies via the Textstyle mark
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
            onSelect: () =>
              editor
                .chain()
                .focus()
                .updateAttributes('paragraph', { lineHeight: '1' })
                .run(),
          },
          {
            label: 'Default (1.5)',
            value: '1.5',
            onSelect: () =>
              editor
                .chain()
                .focus()
                .updateAttributes('paragraph', { lineHeight: '1.5' })
                .run(),
          },
          {
            label: 'Double (2.0)',
            value: '2.0',
            onSelect: () =>
              editor
                .chain()
                .focus()
                .updateAttributes('paragraph', { lineHeight: '2.0' })
                .run(),
          },
          {
            label: 'Unset',
            value: '',
            onSelect: () =>
              editor
                .chain()
                .focus()
                .updateAttributes('paragraph', { lineHeight: null })
                .run(),
          },
        ]}
      />
    </>
  );
}

export default SpacerGroup;
