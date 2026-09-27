import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteStatus = "idle" | "pending" | "error";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string) => Promise<void>;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<DeleteStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isBusy = status === "pending";

  const handleConfirm = async () => {
    if (!password) return;
    setError(null);
    setStatus("pending");
    try {
      await onConfirm(password);
      // parent closes dialog on success via onOpenChange
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Incorrect password");
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPassword("");
      setStatus("idle");
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete account</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account and vault. This cannot be
            undone. Enter your password to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="delete-confirm-password">Password</Label>
          <Input
            id="delete-confirm-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            autoFocus
            disabled={isBusy}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isBusy}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isBusy || !password}
          >
            {isBusy ? "Deleting..." : "Delete account"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
