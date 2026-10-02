import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

import { axiosInstance } from "@/lib/axios";
import { useDataEncryptionKey } from "@/store/useVaultStore";
import { downloadFile } from "@/utils/download";

interface ExportNoteDTO {
  _id: string;
  encryptedContent: string;
}

interface GetNotesForExportResponse {
  success: boolean;
  message: string;
  notes: ExportNoteDTO[];
}

interface ProgressMessage {
  type: "progress";
  completed: number;
  total: number;
}
interface DoneMessage {
  type: "done";
  blob: Blob;
  errors: { noteId: string; title: string; reason: string }[];
}
interface ErrorMessage {
  type: "error";
  message: string;
}
type WorkerMessage = ProgressMessage | DoneMessage | ErrorMessage;

type ExportFormat = "markdown" | "json";

export function useVaultExport() {
  const dek = useDataEncryptionKey();
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{
    completed: number;
    total: number;
  } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  const exportVault = useCallback(
    async (format: ExportFormat, tree: unknown[], archivedNodes: unknown[]) => {
      if (isExporting) return;
      if (!dek) {
        toast.error("Vault is locked — cannot export.");
        return;
      }

      setIsExporting(true);
      setProgress(null);

      try {
        const { data } =
          await axiosInstance.get<GetNotesForExportResponse>("notes/export");
        const notes = data.notes;

        const worker = new Worker(
          new URL("@/lib/export/vault-export.worker.ts", import.meta.url),
          { type: "module" },
        );
        workerRef.current = worker;

        const result = await new Promise<DoneMessage>((resolve, reject) => {
          worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
            const msg = event.data;
            if (msg.type === "progress")
              setProgress({ completed: msg.completed, total: msg.total });
            else if (msg.type === "done") resolve(msg);
            else if (msg.type === "error") reject(new Error(msg.message));
          };
          worker.onerror = (err) => reject(err);

          worker.postMessage({
            type: "start",
            format,
            dek,
            tree,
            archivedNodes,
            notes,
          });
        });

        const label = format === "markdown" ? "export" : "backup";
        downloadFile(
          result.blob,
          `vault-${label}-${new Date().toISOString().slice(0, 10)}.zip`,
          "application/zip",
        );

        if (result.errors.length) {
          toast.warning(
            `Finished with ${result.errors.length} note(s) skipped — see errors.txt.`,
          );
        } else {
          toast.success(
            format === "markdown"
              ? "Vault exported successfully!"
              : "Backup downloaded successfully!",
          );
        }
      } catch (error) {
        console.error("Vault export failed:", error);
        toast.error("Vault export failed. Please try again.");
      } finally {
        workerRef.current?.terminate();
        workerRef.current = null;
        setIsExporting(false);
        setProgress(null);
      }
    },
    [dek, isExporting],
  );

  return { exportVault, isExporting, progress };
}
