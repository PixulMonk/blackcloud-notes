import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordConfirmDialog } from "@/components/dialog/PasswordConfirmDialog";
import { useAuthActions } from "@/store/useAuthStore";
import { useDeriveAuthToken } from "@/hooks/useDeriveAuthToken";
import { useDataActions } from "@/store/useDataStore";
import { useTreeUIActions } from "@/store/useTreeUIStore";

function VaultSection() {
  const { wipeVault } = useAuthActions();
  const deriveAuthToken = useDeriveAuthToken();
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false);

  const { resetData } = useDataActions();
  const { clearSelection } = useTreeUIActions();

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
      {/* TODO: Storage count */}
      <div className="flex flex-col divide-y divide-border">
        {/* <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Storage used</Label>
            <span className="text-xs text-muted-foreground">
              3.2 MB of 500 MB
            </span>
          </div>
          <Progress value={0.6} />
        </div> */}

        {/* TODO: Include export functionality here when export update comes */}
        {/* <div className="flex items-center justify-between py-4">
          <div>
            <Label>Export vault</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Download all your notes as Markdown or PDF.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
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
