import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

interface ToolbarDropdownItem {
  label: string;
  value: string;
  onSelect: () => void;
}

interface ToolbarDropdownProps {
  value: string;
  items: ToolbarDropdownItem[];
  displayValue?: string;
}

function ToolbarDropdown({ value, items, displayValue }: ToolbarDropdownProps) {
  const selectedLabel =
    items.find((item) => item.value === value)?.label ?? value;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-xs font-medium text-muted-foreground"
        >
          {displayValue ?? selectedLabel}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto min-w-0 p-2">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            onMouseDown={(e) => {
              e.preventDefault();
              item.onSelect();
            }}
            className="whitespace-nowrap text-xs"
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ToolbarDropdown;
