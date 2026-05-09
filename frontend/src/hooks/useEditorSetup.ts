import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Dropcursor } from '@tiptap/extensions';
import FileHandler from '@tiptap/extension-file-handler';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import compressImage from '@/utils/compressImage';

const useEditorSetup = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      TextStyle,
      FontSize,
      Placeholder.configure({
        placeholder: 'Start writing…',
      }),
      Image,
      Dropcursor,
      FileHandler.configure({
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
        ],
        onPaste: (editor, files) => {
          files.forEach(async (file) => {
            const compressed = await compressImage(file);
            editor.chain().focus().setImage({ src: compressed }).run();
          });
        },
        onDrop: (editor, files, pos) => {
          files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
              editor
                .chain()
                .insertContentAt(pos, {
                  type: 'image',
                  attrs: { src: reader.result as string },
                })
                .run();
            };
            reader.readAsDataURL(file);
          });
        },
      }),
    ],
    content: '',
  });

  return editor;
};

export default useEditorSetup;
