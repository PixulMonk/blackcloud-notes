import type { MouseEvent } from 'react';
import type { Editor } from '@tiptap/core';

import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
} from 'lucide-react';

import { Button } from './ui/button';
import { ButtonGroup } from './ui/button-group';

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) {
    return null;
  }

  // Helper to prevent focus loss
  const run = (command: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    command();
  };

  return (
    <div className="mt-2">
      <div className="flex flex-row flex-wrap gap-2">
        <ButtonGroup>
          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run(),
            )}
            className={
              editor.isActive('heading', { level: 1 }) ? 'is-active' : ''
            }
          >
            <Heading1 />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run(),
            )}
            className={
              editor.isActive('heading', { level: 2 }) ? 'is-active' : ''
            }
          >
            <Heading2 />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run(),
            )}
            className={
              editor.isActive('heading', { level: 3 }) ? 'is-active' : ''
            }
          >
            <Heading3 />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            variant="outline"
            onMouseDown={run(() => editor.chain().focus().toggleBold().run())}
            className={editor.isActive('bold') ? 'is-active' : ''}
          >
            <Bold />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() => editor.chain().focus().toggleItalic().run())}
            className={editor.isActive('italic') ? 'is-active' : ''}
          >
            <Italic />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() => editor.chain().focus().toggleStrike().run())}
            className={editor.isActive('strike') ? 'is-active' : ''}
          >
            <Strikethrough />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().toggleHighlight().run(),
            )}
            className={editor.isActive('highlight') ? 'is-active' : ''}
          >
            <Highlighter />
          </Button>
        </ButtonGroup>
        <Button
          variant="outline"
          onMouseDown={run(() => editor.chain().focus().setParagraph().run())}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          Paragraph
        </Button>

        <ButtonGroup>
          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().setTextAlign('left').run(),
            )}
            className={
              editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''
            }
          >
            <AlignLeft />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().setTextAlign('center').run(),
            )}
            className={
              editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''
            }
          >
            <AlignCenter />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().setTextAlign('right').run(),
            )}
            className={
              editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''
            }
          >
            <AlignRight />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().setTextAlign('justify').run(),
            )}
            className={
              editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''
            }
          >
            <AlignJustify />
          </Button>
        </ButtonGroup>

        <ButtonGroup>
          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().toggleBulletList().run(),
            )}
            className={editor.isActive('bulletList') ? 'is-active' : ''}
          >
            <List />
          </Button>

          <Button
            variant="outline"
            onMouseDown={run(() =>
              editor.chain().focus().toggleOrderedList().run(),
            )}
            className={editor.isActive('orderedList') ? 'is-active' : ''}
          >
            <ListOrdered />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
};

export default MenuBar;
