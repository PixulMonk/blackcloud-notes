import { renderToMarkdown } from "@tiptap/static-renderer/pm/markdown";
import { MarkdownManager } from "@tiptap/markdown";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "@/lib/editor/extensions";

export function jsonToMarkdown(json: JSONContent): string {
  const manager = new MarkdownManager({ extensions: editorExtensions });
  const markdown = manager.serialize(json);

  return markdown;
}
