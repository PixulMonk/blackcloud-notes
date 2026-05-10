import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';

export const ToolbarButton = ({
  onClick,
  isActive,
  children,
  className,
}: {
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onMouseDown={onClick}
    className={cn(
      'p-1.5 rounded-md transition-colors',
      'text-muted-foreground hover:text-foreground hover:bg-muted',
      isActive && 'text-foreground bg-muted',
      className,
    )}
  >
    {children}
  </button>
);

export const Divider = () => (
  <div
    className="h-5 w-0 border-l border-foreground/20 self-center mx-2 shrink-0"
    aria-hidden="true"
  />
);
