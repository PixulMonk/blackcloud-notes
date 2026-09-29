// pages/Settings/AppearanceSection.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme, useSetTheme } from "@/store/useThemeStore";
import { THEMES } from "@/config/theme";
import type { ThemeMode } from "@/types/theme.types";

export default function AppearanceSection() {
  const currentTheme = useTheme();
  const setTheme = useSetTheme();

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
          <Select
            value={currentTheme}
            onValueChange={(value) => setTheme(value as ThemeMode)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
