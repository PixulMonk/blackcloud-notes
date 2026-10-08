export function selectZipFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip,application/zip,application/x-zip-compressed";
    input.style.display = "none";

    const cleanup = () => {
      document.body.removeChild(input);
    };

    input.addEventListener("change", () => {
      resolve(input.files?.[0] ?? null);
      cleanup();
    });

    // modern browsers fire 'cancel' when the picker is dismissed with no selection
    input.addEventListener("cancel", () => {
      resolve(null);
      cleanup();
    });

    document.body.appendChild(input);
    input.click();
  });
}
