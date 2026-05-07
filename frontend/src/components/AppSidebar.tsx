import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Tree } from './Tree/Tree';

import {
  FilePlus2,
  FolderPlus,
  Search,
  Archive,
  Trash2,
  HelpCircle,
  Lock,
} from 'lucide-react';

import { Button } from './ui/button';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
} from '@/components/ui/sidebar';

import { useData, useDataActions } from '@/store/useDataStore';
import { useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey, useVaultActions } from '@/store/useVaultStore';
import { useIsDark } from '@/store/useThemeStore';
import { Separator } from '@/components/ui/separator';
import SkeletonFileTree from './SkeletonFileTree';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { tree, isLoading } = useData();
  const { fetchTree, addNode } = useDataActions();
  const dataEncryptionKey = useDataEncryptionKey();
  const { clearKeys } = useVaultActions();

  const { setRenamingNodeId } = useTreeUIActions();

  const isDark = useIsDark();
  const logoUrl = isDark
    ? ' /logo/logo-horiz-dark.svg'
    : '/logo/logo-horiz.svg';

  useEffect(() => {
    fetchTree(dataEncryptionKey!);
  }, [fetchTree]);

  const handleCreate = async (type: 'folder' | 'file') => {
    if (!dataEncryptionKey) {
      navigate('/unlock-vault', { state: { from: location.pathname } });
      return;
    }
    const newNode = await addNode(type, dataEncryptionKey);
    if (newNode?._id) {
      setRenamingNodeId(newNode._id);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader className="pt-4 px-2">
        {/* Logo Container */}
        <div className="flex items-center justify-center h-8 mb-4">
          <img
            src={logoUrl} // Removed "public"
            alt="BlackCloud Logo"
            className="h-6 w-auto transition-all group-data-[collapsible=icon]:hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row mx-auto justify-start gap-1 px-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              handleCreate('folder');
            }}
          >
            <FolderPlus className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              handleCreate('file');
            }}
          >
            <FilePlus2 className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="size-8">
            <Search className="size-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroupLabel>Notes</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu></SidebarMenu>
          {isLoading ? <SkeletonFileTree /> : <Tree data={tree} />}
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="p-2 mb-5 gap-1 border-t border-border/20">
        {/* Functional Navigation */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
        >
          <Archive className="size-4 opacity-70" />
          <span>Archived</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
        >
          <Trash2 className="size-4 opacity-70" />
          <span>Trash</span>
        </Button>

        <Separator className="my-1 opacity-50" />

        {/* System / Help Actions */}
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
        >
          <HelpCircle className="size-4 opacity-70" />
          <span>Help & Support</span>
        </Button>

        {/* Security - Lock Vault */}
        <Button
          variant="secondary"
          className="w-full justify-start gap-2 h-9 px-2 text-xs font-semibold mt-2 bg-secondary/30 hover:bg-secondary/50"
          onClick={() => clearKeys()}
        >
          <Lock className="size-3.5" />
          <span>Lock Vault</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
