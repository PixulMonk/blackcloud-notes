import { type MouseEvent } from 'react';

import type { Editor } from '@tiptap/core';

import { Divider } from './toolbar/ToolBarPrimitives';
import { TextStyleGroup } from './toolbar/TextStyleGroup';
import ColourGroup from './toolbar/ColourGroup';
import UndoRedoGroup from './toolbar/UndoRedoGroup';
import FormattingGroup from './toolbar/FormattingGroup';
import AlignmentGroup from './toolbar/AlignmentGroup';
import ListGroup from './toolbar/ListGroup';
import SpacerGroup from './toolbar/SpacerGroup';

// TODO: might need to extract some components. Component's geting a bit thicc

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) return null;

  const run = (command: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    command();
  };

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-4 py-1.5  border-border/50 bg-background">
      <UndoRedoGroup editor={editor} />
      <Divider />

      <TextStyleGroup editor={editor} />
      <Divider />

      <FormattingGroup editor={editor} />
      <ColourGroup editor={editor} />
      <Divider />

      <ListGroup editor={editor} />
      <Divider />

      <AlignmentGroup editor={editor} />
      <SpacerGroup editor={editor} />
    </div>
  );
};

export default MenuBar;
