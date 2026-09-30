export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor); // Firefox requires the anchor to be in the DOM to fire
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url); // release the memory the Blob was holding
}
