import { useState, useCallback } from "react";
import { toast } from "sonner";

import { axiosInstance } from "@/lib/axios";
import { useDataEncryptionKey } from "@/store/useVaultStore";
import { useDataActions } from "@/store/useDataStore";
import { buildImportPayload } from "@/lib/import/buildImportPayload";
import type { VaultImportResponse } from "@/types/import.types";

export function useVaultImport() {
  const dek = useDataEncryptionKey();
  const { fetchTree } = useDataActions();
  const [isImporting, setIsImporting] = useState(false);

  const importVault = useCallback(
    async (zipFile: File) => {
      if (isImporting) return;
      if (!dek) {
        toast.error("Vault is locked — cannot import.");
        return;
      }

      setIsImporting(true);
      try {
        const { payload, skipped } = await buildImportPayload(zipFile, dek);

        if (payload.notes.length === 0) {
          toast.error("No valid backup files found in this zip.");
          return;
        }

        const { data } = await axiosInstance.post<VaultImportResponse>(
          "vault/import",
          payload,
        );

        const totalSkipped = skipped.length + data.errors.length;
        if (totalSkipped > 0) {
          toast.warning(
            `Imported ${data.imported.notes} note(s). ${totalSkipped} item(s) were skipped — check the console for details.`,
          );
          console.warn("Import skipped items:", skipped, data.errors);
        } else {
          toast.success(
            `Imported ${data.imported.notes} note(s) successfully!`,
          );
        }
        await fetchTree(dek); // Refresh the tree after import
      } catch (error) {
        console.error("Vault import failed:", error);
        toast.error("Vault import failed. Please try again.");
      } finally {
        setIsImporting(false);
      }
    },
    [dek, isImporting],
  );

  return { importVault, isImporting };
}
