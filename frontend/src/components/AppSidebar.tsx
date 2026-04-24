import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Tree } from './Tree/Tree';

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

import { useData, useDataActions } from '@/store/useDataStore';
import { useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const { tree } = useData();
  const { fetchTree, addNode } = useDataActions();

  const dataEncryptionKey = useDataEncryptionKey();

  const { setRenamingNodeId } = useTreeUIActions();

  useEffect(() => {
    fetchTree();
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
      <SidebarHeader className="flex flex-row justify-center mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={(e) => {
            e.stopPropagation();
            handleCreate('folder');
          }}
        >
          <FolderPlus />
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
          <Tree data={tree} />
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
}
