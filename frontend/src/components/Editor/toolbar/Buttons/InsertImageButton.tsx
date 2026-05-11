import { useRef } from 'react';

import { Editor } from '@tiptap/react';

import { ImagePlus } from 'lucide-react';

import { ToolbarButton } from '../ToolBarPrimitives';
import compressImage from '@/utils/compressImage';

interface InsertImageButton {
  editor: Editor;
}

function InsertImageButton({ editor }: InsertImageButton) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const compressed = await compressImage(file);
          editor.chain().focus().setImage({ src: compressed }).run();
          e.target.value = ''; // reset so same file can be picked again
        }}
      />

      <ToolbarButton onClick={() => fileInputRef.current?.click()}>
        <ImagePlus size={15} />
      </ToolbarButton>
    </>
  );
}

export default InsertImageButton;
