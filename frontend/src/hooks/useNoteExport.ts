import { toast } from "sonner";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";

import type { Editor } from "@tiptap/core";
import { useTreeUI } from "@/store/useTreeUIStore";

import { downloadFile } from "@/utils/download";
import { sanitizeFilename } from "@/utils/sanitizeFileName";
import { constrainImages } from "@/utils/htmlToPdfmakeHelpers";

pdfMake.addVirtualFileSystem(pdfFonts);

const useNoteExport = () => {
  const { selectedFileTitle } = useTreeUI();

  const exportAsMarkdown = (editor: Editor, noteTitle: string | null) => {
    try {
      const title = noteTitle ? noteTitle : "";
      const contentMarkdown = editor.getMarkdown();

      downloadFile(
        contentMarkdown,
        `${sanitizeFilename(title)}.md`,
        "text/markdown",
      );
      toast.success("Exported as Markdown successfully!");
    } catch (error) {
      console.error("Markdown export failed:", error);
      toast.error("Failed to export Markdown file.");
    }
  };

  const exportAsPDF = async (editor: Editor, noteTitle: string | null) => {
    try {
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

      const fileName = `${sanitizeFilename(noteTitle ?? "")}.pdf`;

      const pdfDocGenerator = pdfMake.createPdf({
        pageSize: "LETTER",
        pageMargins: [40, 40, 40, 40],
        content,
        defaultStyle: { font: "Roboto" },
      });

      // Await the buffer generation so any underlying pdfMake crash is caught here
      const buffer = await pdfDocGenerator.getBuffer();

      if (!buffer || buffer.byteLength === 0) {
        throw new Error("Generated PDF buffer is empty.");
      }

      pdfDocGenerator.download(fileName);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF Export failed:", error);
      toast.error(
        "Failed to generate PDF. Check if images are valid or unsupported formats.",
      );
    }
  };

  const exportAsJSON = (editor: Editor, noteTitle: string | null) => {
    try {
      const json = editor.getJSON();
      downloadFile(
        JSON.stringify(json, null, 2),
        `${sanitizeFilename(noteTitle ?? "note")}.json`,
        "application/json",
      );
      toast.success("JSON backup exported successfully!");
    } catch (error) {
      console.error("JSON export failed:", error);
      toast.error("Failed to export JSON backup.");
    }
  };

  return {
    selectedFileTitle,
    exportAsMarkdown,
    exportAsPDF,
    exportAsJSON,
  };
};

export default useNoteExport;
