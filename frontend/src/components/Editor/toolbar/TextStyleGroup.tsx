import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import ToolbarDropdown from '../ToolbarDropdown';

interface TextStyleGroupProps {
  editor: Editor;
}

const FONT_SIZES = [
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '18',
  '24',
  '30',
  '36',
  '48',
  '60',
  '72',
  '96',
];

export const TextStyleGroup = ({ editor }: TextStyleGroupProps) => {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      const fontSize = e.getAttributes('textStyle').fontSize?.replace('px', '');
      const isH1 = e.isActive('heading', { level: 1 });
      const isH2 = e.isActive('heading', { level: 2 });
      const isH3 = e.isActive('heading', { level: 3 });

      // map heading to its display font size
      const headingFontSize = isH1 ? '32' : isH2 ? '24' : isH3 ? '20' : null;

      // detect mixed selection — has textStyle but no single consistent size
      const { from, to } = e.state.selection;
      const sizes = new Set<string>();
      e.state.doc.nodesBetween(from, to, (node) => {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'textStyle') {
            sizes.add(mark.attrs.fontSize?.replace('px', '') ?? '16');
          }
        });
      });
      const isMixed = sizes.size > 1;

      const blockTypes = new Set<string>();
      e.state.doc.nodesBetween(from, to, (node) => {
        if (node.type.name === 'heading') {
          blockTypes.add(`heading${node.attrs.level}`);
        } else if (node.type.name === 'paragraph') {
          blockTypes.add('paragraph');
        }
      });
      const isMixedBlock = blockTypes.size > 1;

      return {
        fontSize: isMixed ? 'Mixed' : (fontSize ?? headingFontSize ?? '16'),

        blockType: isMixedBlock
          ? 'mixed'
          : isH1
            ? 'heading1'
            : isH2
              ? 'heading2'
              : isH3
                ? 'heading3'
                : 'paragraph',
        isH1,
        isH2,
        isH3,
      };
    },
  });

  const currentFontSize = editorState?.fontSize ?? '16';
  const currentBlockType = editorState?.blockType ?? 'paragraph';
  return (
    <>
      {/* Font Size */}
      <ToolbarDropdown
        // TODO: User should be able to type a font size
        currentValue={currentFontSize}
        items={[
          {
            label: '8',
            value: '8',
            onSelect: () => {
              editor.chain().focus().setFontSize('8px').run();
            },
          },
          {
            label: '9',
            value: '9',
            onSelect: () => {
              editor.chain().focus().setFontSize('9px').run();
            },
          },
          {
            label: '10',
            value: '10',
            onSelect: () => {
              editor.chain().focus().setFontSize('10px').run();
            },
          },
          {
            label: '11',
            value: '11',
            onSelect: () => {
              editor.chain().focus().setFontSize('11px').run();
            },
          },
          {
            label: '12',
            value: '12',
            onSelect: () => {
              editor.chain().focus().setFontSize('12px').run();
            },
          },
          {
            label: '14',
            value: '14',
            onSelect: () => {
              editor.chain().focus().setFontSize('14px').run();
            },
          },
          {
            label: '16',
            value: '16',
            onSelect: () => {
              editor.chain().focus().setFontSize('16px').run();
            },
          },
          {
            label: '18',
            value: '18',
            onSelect: () => {
              editor.chain().focus().setFontSize('18px').run();
            },
          },
          {
            label: '24',
            value: '24',
            onSelect: () => {
              editor.chain().focus().setFontSize('24px').run();
            },
          },
          {
            label: '30',
            value: '30',
            onSelect: () => {
              editor.chain().focus().setFontSize('30px').run();
            },
          },
          {
            label: '36',
            value: '36',
            onSelect: () => {
              editor.chain().focus().setFontSize('36px').run();
            },
          },
          {
            label: '48',
            value: '48',
            onSelect: () => {
              editor.chain().focus().setFontSize('48px').run();
            },
          },
          {
            label: '60',
            value: '60',
            onSelect: () => {
              editor.chain().focus().setFontSize('60px').run();
            },
          },
          {
            label: '72',
            value: '72',
            onSelect: () => {
              editor.chain().focus().setFontSize('72px').run();
            },
          },
          {
            label: '96',
            value: '96',
            onSelect: () => {
              editor.chain().focus().setFontSize('96px').run();
            },
          },
        ]}
        displayValue={currentFontSize === 'mixed' ? 'Mixed' : undefined}
      />
      {/* Block Type */}
      <ToolbarDropdown
        currentValue={currentBlockType}
        items={[
          {
            label: 'Paragraph',
            value: 'paragraph',
            onSelect: () => editor.chain().focus().setParagraph().run(),
          },
          {
            label: 'Heading 1',
            value: 'heading1',
            onSelect: () =>
              editor.chain().focus().setHeading({ level: 1 }).run(),
          },
          {
            label: 'Heading 2',
            value: 'heading2',
            onSelect: () =>
              editor.chain().focus().setHeading({ level: 2 }).run(),
          },
          {
            label: 'Heading 3',
            value: 'heading3',
            onSelect: () =>
              editor.chain().focus().setHeading({ level: 3 }).run(),
          },
        ]}
        displayValue={currentBlockType === 'mixed' ? 'Mixed' : undefined}
      />
    </>
  );
};
