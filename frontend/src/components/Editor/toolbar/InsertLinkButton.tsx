import { useState, useCallback } from 'react';
import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';

import { AlertCircleIcon, Link2 } from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface InsertLinkProps {
  editor: Editor;
}

function InsertLinkButton({ editor }: InsertLinkProps) {
  const [typedUrl, setTypedUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTypedUrl(editorState.previousUrl); // pre-fill with existing link
      setError(null);
    }
    setOpen(isOpen);
  };

  const handleSubmit = useCallback(() => {
    // cancelled

    // empty
    if (typedUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }

    // update link
    try {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: typedUrl })
        .run();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [editor, typedUrl]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const e = ctx.editor!;
      return {
        isLink: e.isActive('link'),
        previousUrl: e.getAttributes('link').href ?? '',
      };
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'p-1.5 rounded-md transition-colors',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              editorState.isLink && 'text-foreground bg-muted',
            )}
          >
            <Link2 size={15} />
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-row gap-4 items-center">
            <Input
              value={typedUrl}
              onChange={(e) => setTypedUrl(e.target.value)}
              placeholder="Paste a link"
            />
            <Button size="sm" onClick={handleSubmit}>
              Apply
            </Button>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertTitle>Invalid link</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </PopoverContent>
      </Popover>
    </>
  );
}

export default InsertLinkButton;
