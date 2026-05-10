// This helper was created to ensure that line-height is applied as a paragraph node attribute
// This addresses the issue in which line-height buttons are not working

export function withLineHeight(extension: any) {
  return extension.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        lineHeight: {
          default: null,
          parseHTML: (el: HTMLElement) => el.style.lineHeight || null,
          renderHTML: (attrs: Record<string, string>) => {
            if (!attrs.lineHeight) return {};
            return { style: `line-height: ${attrs.lineHeight}` };
          },
        },
      };
    },
  });
}
