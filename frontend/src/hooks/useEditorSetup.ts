import { useEditor } from '@tiptap/react';
import { editorExtensions } from '@/lib/editor/extensions';

const useEditorSetup = () => {
  const editor = useEditor({
    editorProps: {
      handleClick(view, pos, event) {
        const attrs = view.state.doc
          .resolve(pos)
          .marks()
          .find((m) => m.type.name === 'link');
        if (attrs && (event.metaKey || event.ctrlKey)) {
          window.open(attrs.attrs.href, '_blank', 'noopener noreferrer');
        }
        return false;
      },
    },
    extensions: editorExtensions,
    content: '',
  });

  return editor;
};

export default useEditorSetup;
