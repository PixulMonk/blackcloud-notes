import type { Editor } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Trash2,
  TableRowsSplit,
  Columns2,
  ArrowDownToLine,
  ArrowUpToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableBubbleMenuProps {
  editor: Editor;
}

function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
  const btnClass = cn(
    'p-1.5 rounded-md transition-colors text-sm',
    'text-muted-foreground hover:text-foreground hover:bg-muted',
  );

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor }) => editor.isActive('table')}
    >
      <div className="flex items-center gap-0.5 rounded-md border border-border bg-background shadow-md px-1 py-0.5">
        {/* Rows */}
        <button
          className={btnClass}
          title="Add row above"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        >
          <ArrowUpToLine size={14} />
        </button>
        <button
          className={btnClass}
          title="Add row below"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        >
          <ArrowDownToLine size={14} />
        </button>
        <button
          className={btnClass}
          title="Delete row"
          onClick={() => editor.chain().focus().deleteRow().run()}
        >
          <Minus size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Columns */}
        <button
          className={btnClass}
          title="Add column before"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        >
          <ArrowLeftToLine size={14} />
        </button>
        <button
          className={btnClass}
          title="Add column after"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        >
          <ArrowRightToLine size={14} />
        </button>
        <button
          className={btnClass}
          title="Delete column"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        >
          <Columns2 size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Merge/split */}
        <button
          className={btnClass}
          title="Merge or split cells"
          onClick={() => editor.chain().focus().mergeOrSplit().run()}
        >
          <TableRowsSplit size={14} />
        </button>

        {/* Divider */}
        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Delete table */}
        <button
          className={cn(btnClass, 'hover:text-destructive')}
          title="Delete table"
          onClick={() => editor.chain().focus().deleteTable().run()}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </BubbleMenu>
  );
}

export default TableBubbleMenu;
