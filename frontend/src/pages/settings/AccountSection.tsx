import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth, useAuthActions } from "@/store/useAuthStore";
import { deriveKeysForLogin, deriveKeysForNewUser } from "@/lib/crypto/kdf";
import { fromBase64 } from "@/lib/crypto/crypto-utils";
import { encryptAESGCM } from "@/lib/crypto/aes";
import { toBase64 } from "@/lib/crypto/crypto-utils";
import { useDataEncryptionKey, useVaultActions } from "@/store/useVaultStore";
import { DeleteAccountDialog } from "@/components/dialog/DeleteAccountDialog";
import { ChangePasswordDialog } from "@/components/dialog/ChangePasswordDialog";

function AccountSection() {
  const navigate = useNavigate();

  const { user, error } = useAuth();
  const { getLoginMetadata, updateUser, deleteAccount, changePassword } =
    useAuthActions();
  const dataEncryptionKey = useDataEncryptionKey();
  const { setKeys, clearKeys } = useVaultActions();

  const [name, setName] = useState(user?.name ?? "");
  type SaveNameStatus = "idle" | "saving" | "success" | "error";
  const [saveNameStatus, setSaveNameStatus] = useState<SaveNameStatus>("idle");
  const [nameError, setNameError] = useState<string | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);

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

  const handleChangePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (!user?.email) throw new Error("No user email available");
    if (!dataEncryptionKey) throw new Error("DEK is not found");

    // Step 1 — verify current password by re-deriving against the CURRENT salt/params
    const currentMetadata = await getLoginMetadata(user.email);
    if (!currentMetadata) {
      throw new Error("Failed to fetch account metadata");
    }
    const { argon2Salt: currentSalt, argon2Params: currentParams } =
      currentMetadata;

    const { authToken: currentAuthToken } = await deriveKeysForLogin(
      currentPassword,
      fromBase64(currentSalt),
      currentParams,
    );

    // Step 2 — derive brand-new salt, KEK, and authToken from the new password
    const {
      argon2Salt: newArgon2Salt,
      keyEncryptionKey: newKeyEncryptionKey,
      authToken: newAuthToken,
      argon2Params: newArgon2Params,
    } = await deriveKeysForNewUser(newPassword);

    // Step 3 — re-encrypt the EXISTING DEK under the new KEK (DEK itself never changes)
    const newProtectedDEK = await encryptAESGCM(
      dataEncryptionKey,
      newKeyEncryptionKey,
    );

    // Step 4 — send everything to the backend for atomic swap
    const result = await changePassword(
      toBase64(currentAuthToken),
      toBase64(newAuthToken),
      newProtectedDEK,
      toBase64(newArgon2Salt),
      newArgon2Params,
    );

    if (result.success) {
      // Update in-memory KEK to match what's now stored server-side;
      // DEK is unchanged so vault stays unlocked, no re-login needed
      setKeys(newKeyEncryptionKey, dataEncryptionKey);
    } else {
      throw new Error(result.error ?? "Failed to change password");
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChangePasswordDialogOpen(true)}
          >
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

      {/* DIALOGS */}
      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteAccount}
      />
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onOpenChange={setChangePasswordDialogOpen}
        onConfirm={handleChangePassword}
      />
    </div>
  );
}

export default AccountSection;
