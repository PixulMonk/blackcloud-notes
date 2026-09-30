import { Printer } from "lucide-react";
import type { Editor } from "@tiptap/core";
import { ToolbarButton } from "../ToolBarPrimitives";
import { useNotePrint } from "@/hooks/useNotePrint";
import { useTreeUI } from "@/store/useTreeUIStore";

export function PrintToolbarButton({ editor }: { editor: Editor | null }) {
  const { selectedFileTitle } = useTreeUI();
  const { printNote } = useNotePrint();

  if (!editor) return null;

  return (
    <ToolbarButton
      onClick={(e) => {
        e.preventDefault();
        printNote(editor, selectedFileTitle);
      }}
      className="flex items-center gap-1.5 px-2"
    >
      <Printer size={15} />
    </ToolbarButton>
  );
}
