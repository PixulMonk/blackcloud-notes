import { useCallback } from "react";
import type { Editor } from "@tiptap/core";
import { sanitizeFilename } from "@/utils/sanitizeFileName";

const PRINT_STYLES = `
  @page { 
    margin: 20mm; 
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #111;
    word-break: break-word;
  }
  img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  table, pre, blockquote, figure { 
    break-inside: avoid; 
  }
  h1, h2, h3 { 
    break-after: avoid; 
  }
  pre, code, mark {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

export const useNotePrint = () => {
  const printNote = useCallback((editor: Editor, noteTitle: string | null) => {
    const title = sanitizeFilename(noteTitle ?? "note");
    const html = editor.getHTML();

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "-9999px";
    iframe.style.top = "-9999px";
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

    iframe.contentWindow!.addEventListener("afterprint", () => {
      iframe.remove();
    });

    setTimeout(() => {
      iframe.contentWindow!.focus();
      iframe.contentWindow!.print();
    }, 250);
  }, []);

  return { printNote };
};
