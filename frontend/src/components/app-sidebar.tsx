import { useState } from 'react';

import { Tree, type TreeNode } from './Tree';

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

const data: TreeNode[] = [
  {
    id: '1',
    title: 'Item 1',
    type: 'folder',
    children: [
      {
        id: '2',
        title: 'Item 1.1',
        type: 'folder',
        children: [
          {
            id: '3',
            title: 'Item 1.1.1',
            type: 'folder',
            children: [
              {
                id: '7',
                title: 'Item 1.1.1.1',
                type: 'file',
              },
            ],
          },
          {
            id: '4',
            title: 'Item 1.1.2',
            type: 'file',
          },
        ],
      },
      {
        id: '5',
        title: 'Item 1.2 (disabled)',
        type: 'file',
        // disabled: true,
      },
    ],
  },
  {
    id: '6',
    title: 'Item 2 (draggable)',
    type: 'file',
    // draggable: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // TODO: craeteNodes function which will create nodes from existing notes in DB
  const [userData, setUserData] = useState(data);

  // TODO: create and move relevant functions to a zustand store for global handling
  // After that it doesnt need to get passed around as args
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);

  const handleCreate = (type: 'folder' | 'file') => {
    const tempId = crypto.randomUUID();
    setUserData((prevData) => [
      ...prevData,
      { id: tempId, title: 'Untitled', type: type },
    ]);
    setRenamingNodeId(tempId);
    // TODO: API call here
  };

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
            data={userData}
            renamingNodeId={renamingNodeId}
            setRenamingNodeId={setRenamingNodeId}
          />
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
}
