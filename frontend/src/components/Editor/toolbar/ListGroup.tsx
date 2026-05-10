import type { Editor } from '@tiptap/core';
import { List, ListOrdered } from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface ListGroupProps {
  editor: Editor;
}
// TODO: checklist
function ListGroup({ editor }: ListGroupProps) {
  return (
    <>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleBulletList().run())}
        isActive={editor.isActive('bulletList')}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleOrderedList().run())}
        isActive={editor.isActive('orderedList')}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
    </>
  );
}

export default ListGroup;
