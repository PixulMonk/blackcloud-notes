import { useCallback } from "react";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";

import type { Editor } from "@tiptap/core";
import { useTreeUI } from "@/store/useTreeUIStore";

import { downloadFile } from "@/utils/download";
import { sanitizeFilename } from "@/utils/sanitizeFileName";
import { constrainImages } from "@/utils/htmlToPdfmakeHelpers";

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

  pdfMake.addVirtualFileSystem(pdfFonts);

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
  /* Keep images contained within page width and prevent awkward cuts */
  img {
    max-width: 100% !important;
    height: auto !important;
    page-break-inside: avoid;
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

  const exportAsPDF = (editor: Editor, noteTitle: string | null) => {
    const rawHtml = editor.getHTML();

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    doc.querySelectorAll("img").forEach((img) => {
      img.style.maxWidth = "100%";
      img.style.height = "auto";
    });

    const processedHtml = doc.body.innerHTML;

    const content = htmlToPdfmake(processedHtml, {
      ignoreStyles: ["font-family"],
    });

    constrainImages(content);

    pdfMake
      .createPdf({
        pageSize: "LETTER",
        pageMargins: [40, 40, 40, 40],
        content,
        defaultStyle: { font: "Roboto" },
      })
      .download(`${sanitizeFilename(noteTitle ?? "")}.pdf`);
  };

  const exportAsJSON = (editor: Editor, noteTitle: string | null) => {
    const json = editor.getJSON();
    downloadFile(
      JSON.stringify(json, null, 2),
      `${sanitizeFilename(noteTitle ?? "note")}.json`,
      "application/json",
    );
  };

  return {
    selectedFileTitle,
    exportAsMarkdown,
    exportAsPDF,
    exportAsJSON,
  };
};

export default useNoteExport;
