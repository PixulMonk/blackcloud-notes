import type { MouseEvent } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  if (!editor) return null;

  const run = (command: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    command();
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-4 py-1.5  border-border/50 bg-background">
      {/* Headings */}
      <ToolbarButton
        onClick={run(() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run(),
        )}
        isActive={editor.isActive('heading', { level: 1 })}
      >
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run(),
        )}
        isActive={editor.isActive('heading', { level: 2 })}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run(),
        )}
        isActive={editor.isActive('heading', { level: 3 })}
      >
        <Heading3 size={15} />
      </ToolbarButton>

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
