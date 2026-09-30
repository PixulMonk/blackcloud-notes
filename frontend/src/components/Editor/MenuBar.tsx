import { type MouseEvent } from "react";

import type { Editor } from "@tiptap/core";

import { Divider, ToolbarButton } from "./toolbar/ToolBarPrimitives";
import { TextStyleGroup } from "./toolbar/Groups/TextStyleGroup";
import ColourGroup from "./toolbar/Groups/ColourGroup";
import UndoRedoGroup from "./toolbar/Groups/UndoRedoGroup";
import FormattingGroup from "./toolbar/Groups/FormattingGroup";
import AlignmentGroup from "./toolbar/Groups/AlignmentGroup";
import ListGroup from "./toolbar/Groups/ListGroup";
import SpacerGroup from "./toolbar/Groups/SpacerGroup";
import ResetFormattingButton from "./toolbar/Buttons/ResetFormattingButton";
import InsertLinkButton from "./toolbar/Buttons/InsertLinkButton";
import InsertImageButton from "./toolbar/Buttons/InsertImageButton";
import InsertTableButton from "./toolbar/Buttons/InsertTableButton";
import ExportDropdown from "./toolbar/Buttons/ExportDrowndown";
import useNoteExport from "@/hooks/useNoteExport";
import { PrintToolbarButton } from "./toolbar/Buttons/PrintToolbarButton";

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) return null;

  const run = (command: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    command();
  };

  const { selectedFileTitle, exportAsMarkdown, exportAsPDF, exportAsJSON } =
    useNoteExport();

  return (
    <div className="flex items-center flex-wrap gap-0.5 px-4 py-1.5  border-border/50 bg-background">
      <UndoRedoGroup editor={editor} />

      <Divider />

      <TextStyleGroup editor={editor} />

      <Divider />

      <FormattingGroup editor={editor} />
      <ColourGroup editor={editor} />
      <ResetFormattingButton editor={editor} />

      <Divider />

      <InsertLinkButton editor={editor} />
      <InsertImageButton editor={editor} />
      <InsertTableButton editor={editor} />

      <Divider />

      <ListGroup editor={editor} />

      <Divider />

      <AlignmentGroup editor={editor} />

      <Divider />

      <SpacerGroup editor={editor} />

      <Divider />

      <ExportDropdown
        options={[
          {
            label: "Markdown (.md)",
            format: "md",
            onSelect: () => exportAsMarkdown(editor, selectedFileTitle),
          },
          {
            label: "PDF",
            format: "pdf",
            onSelect: () => exportAsPDF(editor, selectedFileTitle),
          },
          {
            label: "JSON Backup",
            format: "json",
            onSelect: () => exportAsJSON(editor, selectedFileTitle),
          },
        ]}
      />

      <PrintToolbarButton editor={editor} />
    </div>
  );
};

export default MenuBar;
