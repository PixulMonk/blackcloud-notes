import type { MouseEvent } from 'react';

export const run =
  (command: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    command();
  };
