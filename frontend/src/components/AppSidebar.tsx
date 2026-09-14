import { useEffect } from "react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";

import { Tree } from "./Tree/Tree";

import {
  FileText,
  FolderClosed,
  Search,
  Plus,
  Archive,
  HelpCircle,
  Lock,
  Settings,
} from "lucide-react";

import { Button } from "./ui/button";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useData, useDataActions } from "@/store/useDataStore";
import { useAppStoreActions } from "@/store/useAppStore";
import { useDataEncryptionKey, useVaultActions } from "@/store/useVaultStore";
import { useIsDark } from "@/store/useThemeStore";
import { Separator } from "@/components/ui/separator";
import { confirm } from "@/components/dialog/ConfirmDialog";
import RootDropZone from "./RootDropZone";
import SkeletonFileTree from "./SkeletonFileTree";
import useCreateNode from "@/hooks/useCreateNode";
import { findNodeRecursive, sortTree } from "@/lib/tree/treeHelpers";
import SidebarNotesDropdown from "./SidebarNotesDropdown";
import { useTreeUI } from "@/store/useTreeUIStore";
import TrashDropZone from "./TrashDropZone";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { tree, isInitialLoading } = useData();
  const { sortPreference } = useTreeUI();
  const sortedTree = sortTree(
    tree,
    sortPreference.sortBy,
    sortPreference.order,
  );
  const { fetchTree, softDeleteNode } = useDataActions();
  const dataEncryptionKey = useDataEncryptionKey();
  const { clearKeys } = useVaultActions();

  const { openSettings } = useAppStoreActions();
  const { setActiveView } = useAppStoreActions();
  const { createNode } = useCreateNode();

  const isDark = useIsDark();
  const logoUrl = isDark
    ? " /logo/logo-horiz-dark.svg"
    : "/logo/logo-horiz.svg";

  useEffect(() => {
    fetchTree(dataEncryptionKey!);
  }, []);

  const { updateNode } = useDataActions();

  const handleDragEnd = async (e: DragEndEvent) => {
    const { source, target } = e.operation;

    if (e.canceled || !source || !target) return;

    const activeId = String(source.id);
    const overId = String(target.id);

    if (activeId === overId) return;

    if (overId === "trash") {
      const node = findNodeRecursive(tree, activeId);
      const ok = await confirm({
        title: "Delete",
        message: `Are you sure you want to delete "${node?.title ?? "this item"}"?`,
        yesText: "Delete",
        noText: "Cancel",
      });
      if (ok) {
        await softDeleteNode(activeId);
      }
      return;
    }

    const targetParentId = overId === "root" ? null : overId;

    await updateNode({
      nodeId: activeId,
      dataEncryptionKey: dataEncryptionKey!,
      parentId: targetParentId,
    });
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
              className="size-8 relative"
              title="New Folder"
              onClick={(e) => {
                e.stopPropagation();
                createNode("folder", undefined);
              }}
            >
              <FolderClosed className="size-4" />
              <Plus className="size-2.5 absolute bottom-1 right-1 bg-sidebar text-sidebar-foreground rounded-full ring-1 ring-sidebar-border" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 relative"
              title="New Note"
              onClick={(e) => {
                e.stopPropagation();
                createNode("file", undefined);
              }}
            >
              <FileText className="size-4" />
              <Plus className="size-2.5 absolute bottom-1 right-1 bg-sidebar text-sidebar-foreground rounded-full ring-1 ring-sidebar-border" />
            </Button>

            {/* TODO: Unhide after implementing search feat */}
            {/* <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="Search"
            >
              <Search className="size-4" />
            </Button> */}
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
          {/* <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={() => setActiveView({ type: "archived" })}
          >
            <Archive className="size-4 opacity-70" />
            <span>Archived</span>
          </Button> */}

          <TrashDropZone />

          <Separator className="my-1 opacity-50" />

          {/* System / Help Actions */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={() => openSettings("account")}
          >
            <Settings className="size-4 opacity-70" />
            <span>Settings</span>
          </Button>

          {/* System / Help Actions */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={() => setActiveView({ type: "support" })}
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
