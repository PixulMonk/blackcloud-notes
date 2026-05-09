import { useState, type MouseEvent } from 'react';

import type { Editor } from '@tiptap/core';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

import ToolbarDropdown from './ToolbarDropDown';

interface MenuBarProps {
  editor: Editor | null;
}

const ToolbarButton = ({
  onClick,
  isActive,
  children,
}: {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onMouseDown={onClick}
    className={cn(
      'p-1.5 rounded-md transition-colors',
      'text-muted-foreground hover:text-foreground hover:bg-muted',
      isActive && 'text-foreground bg-muted',
    )}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-border self-center mx-1" />;

const MenuBar = ({ editor }: MenuBarProps) => {
  const [currentBlockType, setCurrentBlockType] = useState('paragraph');
  const [currentFontSize, setCurrentFontSize] = useState('16');

  if (!editor) return null;

  const run = (command: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    command();
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-4 py-1.5  border-border/50 bg-background">
      {/* Undo and Redo */}
      <ToolbarButton onClick={run(() => editor.chain().focus().undo().run())}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={run(() => editor.chain().focus().redo().run())}>
        <Redo2 size={15} />
      </ToolbarButton>

      <Divider />
      {/* Font Size */}
      <ToolbarDropdown
        value={currentFontSize}
        items={[
          {
            label: '8',
            value: '8',
            onSelect: () => {
              setCurrentFontSize('8');
              editor.chain().focus().setFontSize('8px').run();
            },
          },
          {
            label: '9',
            value: '9',
            onSelect: () => {
              setCurrentFontSize('9');
              editor.chain().focus().setFontSize('9px').run();
            },
          },
          {
            label: '10',
            value: '10',
            onSelect: () => {
              setCurrentFontSize('10');
              editor.chain().focus().setFontSize('10px').run();
            },
          },
          {
            label: '11',
            value: '11',
            onSelect: () => {
              setCurrentFontSize('11');
              editor.chain().focus().setFontSize('11px').run();
            },
          },
          {
            label: '12',
            value: '12',
            onSelect: () => {
              setCurrentFontSize('12');
              editor.chain().focus().setFontSize('12px').run();
            },
          },
          {
            label: '14',
            value: '14',
            onSelect: () => {
              setCurrentFontSize('14');
              editor.chain().focus().setFontSize('14px').run();
            },
          },
          {
            label: '16',
            value: '16',
            onSelect: () => {
              setCurrentFontSize('16');
              editor.chain().focus().setFontSize('16px').run();
            },
          },
          {
            label: '18',
            value: '18',
            onSelect: () => {
              setCurrentFontSize('18');
              editor.chain().focus().setFontSize('18px').run();
            },
          },
          {
            label: '24',
            value: '24',
            onSelect: () => {
              setCurrentFontSize('24');
              editor.chain().focus().setFontSize('24px').run();
            },
          },
          {
            label: '30',
            value: '30',
            onSelect: () => {
              setCurrentFontSize('30');
              editor.chain().focus().setFontSize('30px').run();
            },
          },
          {
            label: '36',
            value: '36',
            onSelect: () => {
              setCurrentFontSize('36');
              editor.chain().focus().setFontSize('36px').run();
            },
          },
          {
            label: '48',
            value: '48',
            onSelect: () => {
              setCurrentFontSize('48');
              editor.chain().focus().setFontSize('48px').run();
            },
          },
          {
            label: '60',
            value: '60',
            onSelect: () => {
              setCurrentFontSize('60');
              editor.chain().focus().setFontSize('60px').run();
            },
          },
          {
            label: '72',
            value: '72',
            onSelect: () => {
              setCurrentFontSize('72');
              editor.chain().focus().setFontSize('72px').run();
            },
          },
          {
            label: '96',
            value: '96',
            onSelect: () => {
              setCurrentFontSize('96');
              editor.chain().focus().setFontSize('96px').run();
            },
          },
        ]}
      />

      {/* Block Type */}
      <ToolbarDropdown
        value={currentBlockType}
        items={[
          {
            label: 'Paragraph',
            value: 'paragraph',
            onSelect: () => {
              setCurrentBlockType('paragraph');
              editor.chain().focus().setParagraph().run();
            },
          },
          {
            label: 'Heading 1',
            value: 'heading1',
            onSelect: () => {
              setCurrentBlockType('heading1');
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            },
          },
          {
            label: 'Heading 2',
            value: 'heading2',
            onSelect: () => {
              setCurrentBlockType('heading2');
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            },
          },
          {
            label: 'Heading 3',
            value: 'heading3',
            onSelect: () => {
              setCurrentBlockType('heading2');
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            },
          },
        ]}
      />

      <Divider />

      {/* Formatting */}

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
        onClick={run(() => editor.chain().focus().toggleHighlight().run())}
        isActive={editor.isActive('highlight')}
      >
        <Highlighter size={15} />
      </ToolbarButton>

      <Divider />

      {/* Alignment */}
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

      <Divider />

      {/* Lists */}
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleBulletList().run())}
        isActive={editor.isActive('bulletList')}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleOrderedList().run())}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
    </div>
  );
};

export default MenuBar;
