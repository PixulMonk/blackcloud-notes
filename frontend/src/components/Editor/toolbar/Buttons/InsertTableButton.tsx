import { useState } from 'react';
import type { Editor } from '@tiptap/core';
import { Table } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface InsertTableButtonProps {
  editor: Editor;
}

function InsertTableButton({ editor }: InsertTableButtonProps) {
  const [hovered, setHovered] = useState({ rows: 0, cols: 0 });
  const [open, setOpen] = useState(false);

  const GRID_SIZE = 8;

  const handleInsert = (rows: number, cols: number) => {
    editor
      .chain()
      .focus()
      .insertTable({ rows, cols, withHeaderRow: true })
      .run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'p-1.5 rounded-md transition-colors',
            'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          <Table size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">
            {hovered.rows > 0 && hovered.cols > 0
              ? `${hovered.rows} × ${hovered.cols}`
              : 'Insert table'}
          </p>
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1rem)` }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
              const row = Math.floor(i / GRID_SIZE) + 1;
              const col = (i % GRID_SIZE) + 1;
              const isActive = row <= hovered.rows && col <= hovered.cols;
              return (
                <div
                  key={i}
                  className={cn(
                    'w-4 h-4 border rounded-sm cursor-pointer transition-colors',
                    isActive
                      ? 'bg-primary border-primary'
                      : 'bg-muted border-border hover:border-primary',
                  )}
                  onMouseEnter={() => setHovered({ rows: row, cols: col })}
                  onMouseLeave={() => setHovered({ rows: 0, cols: 0 })}
                  onClick={() => handleInsert(row, col)}
                />
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default InsertTableButton;
