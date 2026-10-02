import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress"; // reusing the pattern already present for storage
import { PasswordConfirmDialog } from "@/components/dialog/PasswordConfirmDialog";
import { confirm } from "@/components/dialog/ConfirmDialog";
import { useAuthActions } from "@/store/useAuthStore";
import { useDeriveAuthToken } from "@/hooks/useDeriveAuthToken";
import { useDataActions, useData } from "@/store/useDataStore"; // adjust to however `tree`/`archivedNodes` are actually selected
import { useTreeUIActions } from "@/store/useTreeUIStore";
import { useVaultExport } from "@/hooks/useVaultExport";

function VaultSection() {
  const { wipeVault } = useAuthActions();
  const deriveAuthToken = useDeriveAuthToken();
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false);

  const { resetData } = useDataActions();
  const { clearSelection } = useTreeUIActions();

  const { tree, archivedNodes } = useData();
  const { exportVault, isExporting, progress } = useVaultExport();
  const [activeAction, setActiveAction] = useState<"markdown" | "json" | null>(
    null,
  );

  const handleExportVault = async () => {
    const ok = await confirm({
      title: "Export vault",
      message:
        "Your notes will be exported as a ZIP file containing Markdown files. During this process, some formatting that is not supported by Markdown format may be lost. Do you want to continue?",
      yesText: "Export",
      noText: "Cancel",
    });
    if (!ok) return;
    setActiveAction("markdown");
    await exportVault("markdown", tree, archivedNodes);
    setActiveAction(null);
  };

  const handleDownloadBackup = async () => {
    const ok = await confirm({
      title: "Download backup",
      message:
        "This downloads a full backup of your vault that can be restored later in BlackCloud. It is not meant to be opened in other apps.",
      yesText: "Download",
      noText: "Cancel",
    });
    if (!ok) return;
    setActiveAction("json");
    await exportVault("json", tree, archivedNodes);
    setActiveAction(null);
  };

  const handleWipeVault = async (password: string) => {
    const authToken = await deriveAuthToken(password);

    const result = await wipeVault(authToken);
    if (!result.success) {
      throw new Error(result.error ?? "Failed to wipe vault");
    }

    // Deselect first so the editor unmounts before the data disappears
    clearSelection();
    resetData();
  };
  return (
    <div className="flex flex-col h-full">
      <h2 className="mb-6 text-sm font-semibold">Vault</h2>
      <div className="flex flex-col divide-y divide-border">
        {/* Export Vault Row */}
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label>Export vault</Label>
              <p className="text-xs text-muted-foreground mt-1.5">
                Download all your notes as Markdown.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportVault}
              disabled={isExporting}
            >
              {isExporting && activeAction === "markdown"
                ? "Exporting…"
                : "Export"}
            </Button>
          </div>
          {isExporting &&
            activeAction === "markdown" &&
            progress &&
            progress.total > 0 && (
              <Progress value={(progress.completed / progress.total) * 100} />
            )}
        </div>

        {/* Download Backup Row */}
        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Download backup</Label>
            <p className="text-xs text-muted-foreground mt-1.5">
              Full backup for restoring in BlackCloud later.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadBackup}
            disabled={isExporting}
          >
            {isExporting && activeAction === "json"
              ? "Downloading…"
              : "Download"}
          </Button>
        </div>

        {/* <div className="flex items-center justify-between py-4">
          <div>
            <Label>Import notes</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Bring in notes from Markdown or another notes app.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Import
          </Button>
        </div> */}
      </div>
      <div className="mt-6">
        <p className="text-sm font-semibold text-destructive mb-4">
          Danger zone
        </p>
        <div className="flex items-center justify-between rounded-md border border-destructive/30 px-4 py-3">
          <div>
            <Label>Wipe vault</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently deletes all your notes and folders. Your account
              stays. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setWipeDialogOpen(true)}
          >
            Wipe
          </Button>
        </div>
      </div>

      <PasswordConfirmDialog
        open={wipeDialogOpen}
        onOpenChange={setWipeDialogOpen}
        onConfirm={handleWipeVault}
        title="Wipe vault"
        description="This permanently deletes all your notes and folders. Your account will remain. This cannot be undone. Enter your password to confirm."
        confirmLabel="Wipe vault"
        pendingLabel="Wiping..."
      />
    </div>
  );
}

export default VaultSection;
