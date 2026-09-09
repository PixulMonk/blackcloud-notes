import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  useIsSettingsOpen,
  useSettingsTab,
  useAppStoreActions,
} from "@/store/useAppStore";
import type { SettingsTab } from "@/types/app.types";
import { CircleUser, ShieldUser, LockKeyhole, Palette } from "lucide-react";
import AccountSection from "@/pages/settings/AccountSection";
import SecuritySection from "@/pages/settings/SecuritySection";
import VaultSection from "@/pages/settings/VaultSection";
import AppearanceSection from "@/pages/settings/AppearanceSection";

function SettingsDialog() {
  const isOpen = useIsSettingsOpen();
  const tab = useSettingsTab();
  const { closeSettings, setSettingsTab } = useAppStoreActions();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSettings()}>
      <DialogContent className="sm:max-w-4xl w-full h-[560px] p-0 overflow-hidden">
        <Tabs
          value={tab}
          onValueChange={(v) => setSettingsTab(v as SettingsTab)}
          orientation="vertical"
          className="flex flex-row h-full"
        >
          <TabsList className="flex flex-col h-full w-48 items-stretch justify-start gap-1 bg-transparent p-2 pt-8">
            <p className="m-2 text-xs">Settings</p>
            <TabsTrigger value="account" className="justify-start">
              <CircleUser className="mr-2 size-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="justify-start">
              <ShieldUser className="mr-2 size-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="vault" className="justify-start">
              <LockKeyhole className="mr-2 size-4" />
              Vault
            </TabsTrigger>
            <TabsTrigger value="appearance" className="justify-start">
              <Palette className="mr-2 size-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <Separator orientation="vertical" />

          <div className="flex-1 p-8 overflow-y-auto">
            <TabsContent value="account">
              <AccountSection />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySection />
            </TabsContent>
            <TabsContent value="vault">
              <VaultSection />
            </TabsContent>
            <TabsContent value="appearance">
              <AppearanceSection />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
