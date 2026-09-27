import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth, useAuthActions } from "@/store/useAuthStore";
import { deriveKeysForLogin } from "@/lib/crypto/kdf";
import { fromBase64 } from "@/lib/crypto/crypto-utils";
import { useVaultActions } from "@/store/useVaultStore";
import { DeleteAccountDialog } from "@/components/dialog/DeleteAccountDialog";

function AccountSection() {
  const navigate = useNavigate();

  const { user, error } = useAuth();
  const { getLoginMetadata, updateUser, deleteAccount } = useAuthActions();
  const { clearKeys } = useVaultActions();

  const [name, setName] = useState(user?.name ?? "");
  type SaveNameStatus = "idle" | "saving" | "success" | "error";
  const [saveNameStatus, setSaveNameStatus] = useState<SaveNameStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user]);

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) return;

    setSaveNameStatus("saving");
    setNameError(null);
    try {
      const success = await updateUser({ name: name.trim() });
      setSaveNameStatus(success ? "success" : "error");
      if (!success) setNameError("Failed to update name");
    } catch {
      setSaveNameStatus("error");
      setNameError("Failed to update name");
    }
  };

  const handleDeleteAccount = async (password: string) => {
    if (!user?.email) throw new Error("No user email available");

    const loginMetaData = await getLoginMetadata(user.email);
    if (!loginMetaData) {
      throw new Error("Failed to fetch account metadata");
    }

    const { argon2Salt, argon2Params } = loginMetaData;

    const { authToken } = await deriveKeysForLogin(
      password,
      fromBase64(argon2Salt),
      argon2Params,
    );

    const success = await deleteAccount(authToken);
    if (success) {
      clearKeys();
      navigate("/login");
    } else {
      throw new Error(error ?? "Failed to delete account");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="mt-1.5 mb-6 text-sm font-semibold">Account</h2>

      <div className="flex flex-col divide-y divide-border">
        {/* <div className="flex items-center justify-between py-4">
          <div>
            <Label>Avatar</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Shown on your profile.
            </p>
          </div>
          <Avatar>
            <AvatarImage src="/path-to-avatar.png" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
        </div> */}

        <div className="flex items-center justify-between py-4">
          <div>
            <Label htmlFor="display-name">Display name</Label>
            <p className="text-xs text-muted-foreground mt-1">
              How you appear across the app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="display-name"
              className="w-48"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Button
              size="sm"
              disabled={saveNameStatus == "saving" || name === user?.name}
              onClick={handleSaveName}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Change password</Label>
            <p className="text-xs text-muted-foreground mt-1">
              You'll need your current password to confirm.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Change
          </Button>
        </div>
      </div>

      <Separator className="my-2 opacity-0" />

      <div className="mt-6">
        <p className="text-sm font-semibold text-destructive mb-4">
          Danger zone
        </p>
        <div className="flex items-center justify-between rounded-md border border-destructive/30 px-4 py-3">
          <div>
            <Label>Delete account</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Permanently deletes your account and vault. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}

export default AccountSection;
