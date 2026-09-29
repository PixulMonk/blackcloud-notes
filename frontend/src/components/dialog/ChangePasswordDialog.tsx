import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordStrengthBar from "@/components/PasswordStrengthBar";
import PasswordRequirements from "@/components/PasswordRequirements";
import { arePasswordRequirementsMet } from "@/utils/passwordRules";

type ChangePasswordStatus = "idle" | "pending" | "error";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  onConfirm,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [status, setStatus] = useState<ChangePasswordStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isBusy = status === "pending";
  const inputType = showPasswords ? "text" : "password";

  const reset = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
    setStatus("idle");
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (isBusy) return; // don't allow closing mid-request
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatus("error");
      setError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("error");
      setError("New passwords do not match.");
      return;
    }
    if (!arePasswordRequirementsMet(newPassword)) {
      setStatus("error");
      setError("New password does not meet requirements.");
      return;
    }
    if (newPassword === currentPassword) {
      setStatus("error");
      setError("New password must be different from your current one.");
      return;
    }

    setError(null);
    setStatus("pending");
    try {
      await onConfirm(currentPassword, newPassword);
      reset();
      onOpenChange(false);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Your notes stay intact. Enter your current password to confirm the
              change.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type={inputType}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isBusy}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type={inputType}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isBusy}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-new-password">Confirm new password</Label>
            <Input
              id="confirm-new-password"
              type={inputType}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isBusy}
            />
            <PasswordStrengthBar password={newPassword} />
            <PasswordRequirements password={newPassword} />
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => setShowPasswords((prev) => !prev)}
          >
            {showPasswords ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </Button>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Changing..." : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
