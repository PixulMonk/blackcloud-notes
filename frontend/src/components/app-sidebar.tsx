// The code is dogshit. I have started writing my own. See Tree.tsx

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
    name: 'Item 1',
    type: 'folder',
    children: [
      {
        id: '2',
        name: 'Item 1.1',
        type: 'folder',
        children: [
          {
            id: '3',
            name: 'Item 1.1.1',
            type: 'folder',
            children: [
              {
                id: '7',
                name: 'Item 1.1.1.1',
                type: 'file',
              },
            ],
          },
          {
            id: '4',
            name: 'Item 1.1.2',
            type: 'file',
          },
        ],
      },
      {
        id: '5',
        name: 'Item 1.2 (disabled)',
        type: 'file',
        // disabled: true,
      },
    ],
  },
  {
    id: '6',
    name: 'Item 2 (draggable)',
    type: 'file',
    // draggable: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row justify-center mt-2">
        <Button variant="ghost" size="icon">
          <FolderPlus />
        </Button>
        <Button variant="ghost" size="icon" className="size-8">
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
          <Tree data={data} />
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
}
