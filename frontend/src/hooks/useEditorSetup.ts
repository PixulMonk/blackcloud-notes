import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { Dropcursor } from '@tiptap/extensions';
import FileHandler from '@tiptap/extension-file-handler';
import {
  FontSize,
  TextStyle,
  FontFamily,
  LineHeight,
} from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';

import compressImage from '@/utils/compressImage';
import { withLineHeight } from '@/lib/editor/withLineHeight';

const useEditorSetup = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false, // disable built-in paragraph
        heading: false, // disable built-in heading
      }),
      withLineHeight(Paragraph).configure({
        HTMLAttributes: { class: 'line-height-target' },
      }),
      withLineHeight(Heading).configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      // TipTap V3's LineHeight extension applies via the Textstyle mark
      LineHeight.configure({
        types: ['textStyle'],
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      FontSize,
      FontFamily,
      TaskList,
      Superscript,
      Subscript,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'flex items-center not-prose gap-2', // Tailwind classes for alignment
        },
      }),
      Color,
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
