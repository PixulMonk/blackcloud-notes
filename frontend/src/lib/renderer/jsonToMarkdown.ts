import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "@/lib/editor/extensions";

export function jsonToMarkdown(json: JSONContent): string {
  return renderToMarkdown({ content: json, extensions: editorExtensions });
}
