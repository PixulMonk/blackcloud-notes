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
  <div className="w-px h-5 bg-border self-center mx-1" />
);
