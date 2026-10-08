export const constrainImages = (node: any) => {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach(constrainImages);
  } else if (typeof node === "object") {
    if (node.image) {
      // If the image is taller than ~400 points, clamp its height
      // and let pdfMake proportionally scale the width to match.
      if (node.height && node.height > 400) {
        const ratio = 400 / node.height;
        node.height = 400;
        if (node.width) node.width = node.width * ratio;
      }
      // Fallback safeguard if pdfMake didn't pick up a native height yet
      if (!node.height && !node.width) {
        node.width = 450; // Forces a safe default width boundary
      }
    }
    Object.keys(node).forEach((key) => {
      if (typeof node[key] === "object") {
        constrainImages(node[key]);
      }
    });
  }
};
