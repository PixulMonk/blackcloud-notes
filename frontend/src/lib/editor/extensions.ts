import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import { Dropcursor } from '@tiptap/extensions';

import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import FileHandler from '@tiptap/extension-file-handler';
import Link from '@tiptap/extension-link';
import { Color } from '@tiptap/extension-color';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import {
  FontSize,
  TextStyle,
  FontFamily,
  LineHeight,
} from '@tiptap/extension-text-style';
import Youtube from '@tiptap/extension-youtube';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';

import compressImage from '@/utils/compressImage';
import { withLineHeight } from '@/lib/editor/withLineHeight';

const lowlight = createLowlight(common);

export const editorExtensions = [
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
  CodeBlockLowlight.configure({
    lowlight,
  }),
  Placeholder.configure({
    placeholder: 'Start writing…',
  }),
  Image,
  Dropcursor,
  FileHandler.configure({
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
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
  Link.configure({
    openOnClick: false,
    autolink: true,
    defaultProtocol: 'https',
    protocols: ['http', 'https'],
    isAllowedUri: (url, ctx) => {
      try {
        const parsedUrl = url.includes(':')
          ? new URL(url)
          : new URL(`${ctx.defaultProtocol}://${url}`);

        if (!ctx.defaultValidate(parsedUrl.href)) return false;

        const allowedProtocols = ctx.protocols.map((p) =>
          typeof p === 'string' ? p : p.scheme,
        );

        return allowedProtocols.includes(parsedUrl.protocol.replace(':', ''));
      } catch {
        return false;
      }
    },
    shouldAutoLink: (url) => {
      try {
        const parsedUrl = url.includes(':')
          ? new URL(url)
          : new URL(`https://${url}`);
        return (
          parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:'
        );
      } catch {
        return false;
      }
    },
    HTMLAttributes: {
      rel: 'noopener noreferrer',
    },
  }),
  Youtube.configure({
    controls: false,
    nocookie: true,
  }),
];
