import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { List, ListOrdered, ListChecks } from 'lucide-react';

import { ToolbarButton } from './ToolBarPrimitives';
import { run } from './toolbarUtils';

interface ListGroupProps {
  editor: Editor;
}
// TODO: checklist
function ListGroup({ editor }: ListGroupProps) {
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      return {
        isBulletList: e.isActive('bulletList'),
        isOrderedList: e.isActive('orderedList'),
        isTaskList: e.isActive('taskList'),
      };
    },
  });
  return (
    <>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleBulletList().run())}
        isActive={editorState?.isBulletList ?? false}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleOrderedList().run())}
        isActive={editorState?.isOrderedList ?? false}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        onClick={run(() => editor.chain().focus().toggleTaskList().run())}
        isActive={editorState?.isTaskList ?? false}
      >
        <ListChecks size={15} />
      </ToolbarButton>
    </>
  );
}

export default ListGroup;
