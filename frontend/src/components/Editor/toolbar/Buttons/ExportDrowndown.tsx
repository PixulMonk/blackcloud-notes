import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ExportOption {
  label: string;
  format: "md" | "pdf" | "docx";
  onSelect: () => void | Promise<void>;
  disabled?: boolean;
}

interface ExportDropdownProps {
  options: ExportOption[];
}

function ExportDropdown({ options }: ExportDropdownProps) {
  const [pending, setPending] = useState(false);

  const handleSelect = async (option: ExportOption) => {
    if (option.disabled || pending) return;
    setPending(true);
    try {
      await option.onSelect();
    } finally {
      setPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={pending}
          className={cn(
            "flex items-center gap-0.5 px-2 py-1.5 rounded-md transition-colors",
            "text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted",
            pending && "opacity-60 cursor-wait",
          )}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto min-w-[140px] p-1">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.format}
            disabled={option.disabled}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(option);
            }}
            className="whitespace-nowrap text-xs cursor-pointer"
          >
            {option.label}
            {option.disabled && (
              <span className="ml-auto text-[10px] text-muted-foreground">
                soon
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ExportDropdown;
