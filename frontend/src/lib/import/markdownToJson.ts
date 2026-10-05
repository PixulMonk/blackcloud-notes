import { MarkdownManager } from "@tiptap/markdown";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "@/lib/editor/extensions";

export function markdownToJson(markdown: string): JSONContent {
  const manager = new MarkdownManager({ extensions: editorExtensions });
  return manager.parse(markdown);
}
