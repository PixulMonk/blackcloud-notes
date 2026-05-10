import type { ReactNode } from 'react';
import { Pipette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { EDITOR_COLOR_COLUMNS } from '@/constants/editorColours';
import { isLight } from '@/lib/editor/colourPickerHelpers';

interface ColourDropdownProps {
  icon?: ReactNode;
  currentHexValue: string | null;
  onColorSelect: (hex: string) => void;
  onClear?: () => void;
}

function ColourDropdown({
  icon,
  currentHexValue,
  onColorSelect,
  onClear,
}: ColourDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="flex flex-col items-center gap-0.5 h-8 w-8 text-muted-foreground"
        >
          {icon ?? <Pipette size={14} />}
          <div
            className="h-0.5 w-4 rounded-full"
            style={{
              backgroundColor: currentHexValue ?? 'transparent',
              border: currentHexValue ? 'none' : '1px dashed currentColor',
            }}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="p-3 w-auto">
        <div className="flex flex-row gap-1">
          {EDITOR_COLOR_COLUMNS.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-1">
              {column!.map((hex) => (
                <button
                  key={hex}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onColorSelect(hex);
                  }}
                  className="h-5 w-5 rounded-sm flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: hex,
                    border: isLight(hex)
                      ? '1px solid #e2e8f0'
                      : '1px solid transparent',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
        {onClear && (
          <DropdownMenuItem
            onMouseDown={(e) => {
              e.preventDefault();
              onClear();
            }}
            className="mt-2 text-xs text-muted-foreground justify-center"
          >
            Clear
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ColourDropdown;
