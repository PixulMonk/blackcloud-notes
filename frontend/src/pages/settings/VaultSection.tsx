import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

function VaultSection() {
  return (
    <div className="flex flex-col h-full">
      <h2 className="mb-6 text-sm font-semibold">Vault</h2>

      <div className="flex flex-col divide-y divide-border">
        <div className="py-4">
          <div className="flex items-center justify-between mb-2">
            <Label>Storage used</Label>
            <span className="text-xs text-muted-foreground">
              3.2 MB of 500 MB
            </span>
          </div>
          <Progress value={0.6} />
        </div>

        <div className="flex items-center justify-between py-4">
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
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Encryption</Label>
            <p className="text-xs text-muted-foreground mt-1">
              AES-256-GCM, key derived with Argon2id.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-destructive mb-4">
          Danger zone
        </p>
        <div className="flex items-center justify-between rounded-md border border-destructive/30 px-4 py-3">
          <div>
            <Label>Wipe vault</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently deletes all notes. Your account stays active.
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Wipe
          </Button>
        </div>
      </div>
    </div>
  );
}

export default VaultSection;
