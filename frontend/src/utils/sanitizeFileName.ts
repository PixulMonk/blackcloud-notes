export function sanitizeFilename(name: string, fallback = "untitled"): string {
  const sanitized = name
    .trim()
    // strip emoji: pictographs, variation selectors, ZWJ, skin-tone modifiers
    .replace(
      /\p{Extended_Pictographic}|\uFE0F|\u200D|[\u{1F3FB}-\u{1F3FF}]/gu,
      "",
    )
    // illegal on Windows (and unwise on Mac/Linux): \ / : * ? " < > |
    .replace(/[\\/:*?"<>|]/g, "")
    // control characters
    .replace(/[\x00-\x1f]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[.\s]+$/, "");

  const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
  const safe = reserved.test(sanitized) ? `${sanitized}_` : sanitized;

  return (safe || fallback).slice(0, 255);
}
