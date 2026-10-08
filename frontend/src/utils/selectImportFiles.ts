export function selectImportFiles(): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      ".zip,.md,.json,application/zip,application/x-zip-compressed";
    input.multiple = true;
    input.style.display = "none";

    const cleanup = () => document.body.removeChild(input);

    input.addEventListener("change", () => {
      resolve(input.files && input.files.length > 0 ? input.files : null);
      cleanup();
    });
    input.addEventListener("cancel", () => {
      resolve(null);
      cleanup();
    });

    document.body.appendChild(input);
    input.click();
  });
}
