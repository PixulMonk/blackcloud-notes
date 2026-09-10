import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function AccountSection() {
  return (
    <div className="flex flex-col h-full">
      <h2 className="mt-1.5 mb-6 text-sm font-semibold">Account</h2>

      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-4">
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
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label htmlFor="display-name">Display name</Label>
            <p className="text-xs text-muted-foreground mt-1">
              How you appear across the app.
            </p>
          </div>
          <Input id="display-name" className="w-48" defaultValue="Ssor" />
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
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AccountSection;
