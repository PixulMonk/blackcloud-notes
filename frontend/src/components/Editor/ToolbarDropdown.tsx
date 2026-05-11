import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ToolbarDropdownItem {
  label: string;
  value: string;
  onSelect: () => void;
}

interface ToolbarDropdownProps {
  currentValue: string;
  items: ToolbarDropdownItem[];
  displayValue?: string;
  icon?: ReactNode;
}

function ToolbarDropdown({
  currentValue,
  items,
  displayValue,
  icon,
}: ToolbarDropdownProps) {
  const selectedLabel =
    items.find((item) => item.value === currentValue)?.label ?? currentValue;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-0.5 px-2 py-1.5 rounded-md transition-colors',
            'text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
        >
          {icon ? (
            <>
              {icon}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </>
          ) : (
            <>
              {displayValue ?? selectedLabel}
              <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto min-w-[120px] p-1">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onMouseDown={(e) => {
              e.preventDefault();
              item.onSelect();
            }}
            className="whitespace-nowrap text-xs cursor-pointer"
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ToolbarDropdown;
