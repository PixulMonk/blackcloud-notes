import { useCallback } from "react";

import type { Editor } from "@tiptap/core";
import { useTreeUI } from "@/store/useTreeUIStore";
import { downloadFile } from "@/utils/download";
import { sanitizeFilename } from "@/utils/sanitizeFileName";

const useNoteExport = () => {
  const { selectedFileTitle } = useTreeUI();

  const exportAsMarkdown = (editor: Editor, noteTitle: string | null) => {
    const title = noteTitle ? noteTitle : "";
    const contentMarkdown = editor.getMarkdown();

    downloadFile(
      contentMarkdown,
      `${sanitizeFilename(title)}.md`,
      "text/markdown",
    );
  };

  const exportAsPDF = useCallback(
    (editor: Editor, noteTitle: string | null) => {
      const title = sanitizeFilename(noteTitle ?? "");
      const html = editor.getHTML();

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "-9999px";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument!;
      doc.open();
      doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>${PRINT_STYLES}</style>
      </head>
      <body>${html}</body>
    </html>
  `);
      doc.close();

      iframe.contentWindow!.addEventListener("afterprint", () =>
        iframe.remove(),
      );
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
    },
    [],
  );

  const PRINT_STYLES = `
  @page { margin: 2cm; }
  body {
    font-family: Georgia, serif;
    font-size: 11pt;
    line-height: 1.5;
    color: #000;
  }
  table, pre, blockquote, figure { break-inside: avoid; }
  h1, h2, h3 { break-after: avoid; }
  pre, code, mark {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

  return { selectedFileTitle, exportAsMarkdown, exportAsPDF };
};

export default useNoteExport;
