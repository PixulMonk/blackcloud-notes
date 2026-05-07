import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth, useAuthActions } from '@/store/useAuthStore';
import { Sun, Moon, Bell } from 'lucide-react';
import { useIsDark, useThemeStoreActions } from '@/store/useThemeStore';
import { DocumentTitle } from './Editor/DocumentTitle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { user } = useAuth();
  const { logout } = useAuthActions();
  const isDark = useIsDark();
  const { toggleTheme } = useThemeStoreActions();
  return (
    <header className="flex mb-4 py-2  px-7 h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) ">
      <SidebarTrigger className="-ml-1" />

      <Separator
        orientation="vertical"
        className="mx-2 data-[orientation=vertical]:h-4"
      />
      <DocumentTitle />
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-border/40"
        >
          <Bell />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-border/40"
          onClick={() => toggleTheme()}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-accent"
            >
              <Avatar className="h-7 w-7 border border-border/50">
                <AvatarImage alt={user?.name} />
                <AvatarFallback className="text-[10px] bg-primary/10">
                  {user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium">
                {user?.name}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => logout()}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
