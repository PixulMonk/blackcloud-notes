import { useEffect } from 'react';
import { DragDropProvider } from '@dnd-kit/react';

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
import { useAppStoreActions } from '@/store/useAppStore';
import { useDataEncryptionKey, useVaultActions } from '@/store/useVaultStore';
import { useIsDark } from '@/store/useThemeStore';
import { Separator } from '@/components/ui/separator';
import RootDropZone from './RootDropZone';
import SkeletonFileTree from './SkeletonFileTree';
import useCreateNode from '@/hooks/useCreateNode';
import { sortTree } from '@/lib/tree/treeHelpers';
import SidebarNotesDropdown from './SidebarNotesDropdown';
import { useTreeUI } from '@/store/useTreeUIStore';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { tree, isInitialLoading } = useData();
  const { sortPreference } = useTreeUI();
  const sortedTree = sortTree(
    tree,
    sortPreference.sortBy,
    sortPreference.order,
  );
  const { fetchTree } = useDataActions();
  const dataEncryptionKey = useDataEncryptionKey();
  const { clearKeys } = useVaultActions();

  const { setActiveView } = useAppStoreActions();
  const { createNode } = useCreateNode();

  const isDark = useIsDark();
  const logoUrl = isDark
    ? ' /logo/logo-horiz-dark.svg'
    : '/logo/logo-horiz.svg';

  useEffect(() => {
    fetchTree(dataEncryptionKey!);
  }, []);

  const { updateNode } = useDataActions();

  const handleDragEnd = (e: any) => {
    const { source, target } = e.operation;

    if (e.canceled || !target) return;

    const activeId = source.id as string;
    const overId = target.id as string;

    if (activeId === overId) return;

    const targetParentId = overId === 'root' ? null : overId;

    updateNode(
      activeId,
      dataEncryptionKey!,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      targetParentId,
    );
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
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
                createNode('folder', undefined);
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
                createNode('file', undefined);
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
          <SidebarGroup>
            <div className="flex items-center justify-between">
              <SidebarGroupLabel>Notes</SidebarGroupLabel>
              <SidebarNotesDropdown />
            </div>
          </SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu></SidebarMenu>
            {isInitialLoading ? (
              <SkeletonFileTree />
            ) : (
              <Tree data={sortedTree} />
            )}
          </SidebarGroupContent>
          <RootDropZone />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter className="p-2 mb-5 gap-1 border-t border-border/20">
          {/* Functional Navigation */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={() => setActiveView({ type: 'archived' })}
          >
            <Archive className="size-4 opacity-70" />
            <span>Archived</span>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={() => setActiveView({ type: 'trash' })}
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
    </DragDropProvider>
  );
}
