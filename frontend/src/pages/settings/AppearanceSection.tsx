// pages/Settings/AppearanceSection.tsx
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Monitor } from "lucide-react";
import { useIsDark } from "@/store/useThemeStore";

function AppearanceSection() {
  const isDark = useIsDark();

  return (
    <div className="flex flex-col h-full">
      <h2 className="mb-6 text-sm font-semibold">Appearance</h2>

      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Theme</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Choose how BlackCloud looks on this device.
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border p-1">
            <Button
              variant={!isDark ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
            >
              <Sun className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <Monitor className="size-4" />
            </Button>
            <Button
              variant={isDark ? "secondary" : "ghost"}
              size="icon"
              className="size-8"
            >
              <Moon className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Editor font</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Font used inside your notes.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Default
          </Button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div>
            <Label>Line height</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Spacing between lines in the editor.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Comfortable
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AppearanceSection;
