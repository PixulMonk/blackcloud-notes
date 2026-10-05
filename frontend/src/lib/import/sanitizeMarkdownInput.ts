// Strips a leading UTF-8 BOM (common in files saved/exported by Windows tools)
// and a leading YAML frontmatter block (common in Obsidian, Jekyll/Hugo, etc.)
export function sanitizeMarkdownInput(raw: string): string {
  let text = raw;

  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const frontmatterMatch = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (frontmatterMatch) {
    text = text.slice(frontmatterMatch[0].length);
  }

  return text;
}
