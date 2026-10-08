import type { JSONContent } from "@tiptap/core";
import { markdownToJson } from "@/lib/import/markdownToJson";
import { sanitizeMarkdownInput } from "@/lib/import/sanitizeMarkdownInput";

function isValidTiptapDoc(value: unknown): value is JSONContent {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc" &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

export interface ParsedFile {
  title: string;
  docJson: JSONContent;
}

export interface ParseFailure {
  path: string;
  reason: string;
}

// name: the file's own name (or full zip-internal path), used both for the
// title and for reporting in skipped[]
export function parseFileEntry(
  name: string,
  raw: string,
): ParsedFile | ParseFailure {
  const isJson = name.endsWith(".json");
  const isMd = name.endsWith(".md");
  if (!isJson && !isMd) {
    return { path: name, reason: "Unsupported file type" };
  }

  const title = name
    .split("/")
    .pop()!
    .replace(/\.(json|md)$/, "");

  if (isJson) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { path: name, reason: "Invalid JSON" };
    }
    if (!isValidTiptapDoc(parsed)) {
      return { path: name, reason: "Not a recognized note document" };
    }
    return { title, docJson: parsed };
  }

  try {
    const docJson = markdownToJson(sanitizeMarkdownInput(raw));
    return { title, docJson };
  } catch {
    return { path: name, reason: "Could not parse Markdown" };
  }
}

export function isParseFailure(
  result: ParsedFile | ParseFailure,
): result is ParseFailure {
  return "reason" in result;
}
