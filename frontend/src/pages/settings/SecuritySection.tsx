import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

function SecuritySection() {
  return (
    <div className="flex flex-col h-full">
      <h2 className="mb-6 text-sm font-semibold">Security</h2>

      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Two-factor authentication</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Require a code from your authenticator app at login.
            </p>
          </div>
          {/* TODO: remove disabled once 2FA has been implemented*/}
          <Switch disabled />
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Active sessions</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Devices currently signed in to your account.
            </p>
          </div>
          <Button variant="outline" size="sm">
            View sessions
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Login history</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Recent sign-ins to your account.
            </p>
          </div>
          <Button variant="outline" size="sm">
            View history
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-md border border-border p-4">
        <div className="flex items-center gap-2 mb-2">
          <Label className="text-sm">Zero-knowledge recovery</Label>
          <Badge variant="secondary" className="text-[10px]">
            Important
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your notes are encrypted on your device before they ever reach our
          servers — we never see your password or your data. This means we
          cannot reset your password or recover your vault if you lose it. Keep
          your password somewhere safe.
        </p>
      </div>
    </div>
  );
}

export default SecuritySection;
