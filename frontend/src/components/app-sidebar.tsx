import { useState, useEffect } from 'react';

import { Tree } from './Tree';

import { FilePlus2, FolderPlus, Search } from 'lucide-react';

import { Button } from './ui/button';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
} from '@/components/ui/sidebar';

import { useDataStore } from '@/store/useDataStore';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const tree = useDataStore((state) => state.tree);
  const fetchTree = useDataStore((state) => state.fetchTree);
  const addNode = useDataStore((state) => state.addNode);

  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);

  const handleCreate = async (type: 'folder' | 'file') => {
    const newNode = await addNode(type);
    if (newNode?._id) {
      setRenamingNodeId(newNode._id);
    }
  };

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row justify-center mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => handleCreate('folder')}
        >
          <FolderPlus />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => handleCreate('file')}
        >
          <FilePlus2 />
        </Button>
        <Button variant="ghost" size="icon" className="size-8">
          <Search />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel>Notes</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu></SidebarMenu>
          <Tree
            data={tree}
            renamingNodeId={renamingNodeId}
            setRenamingNodeId={setRenamingNodeId}
          />
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
}
