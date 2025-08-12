import { TreeView, type TreeDataItem } from '@/components/ui/tree-view';

import {
  ChevronRight,
  File,
  FilePlus2,
  Folder,
  FolderOpen,
  FolderPlus,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from '@/components/ui/sidebar';

const data: TreeDataItem[] = [
  {
    id: '1',
    name: 'Item 1',
    children: [
      {
        id: '2',
        name: 'Item 1.1',
        children: [
          {
            id: '3',
            name: 'Item 1.1.1',
          },
          {
            id: '4',
            name: 'Item 1.1.2',
          },
        ],
      },
      {
        id: '5',
        name: 'Item 1.2 (disabled)',
        disabled: true,
      },
    ],
  },
  {
    id: '6',
    name: 'Item 2 (draggable)',
    draggable: true,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex flex-row justify-center mt-2">
        <Button variant="secondary" size="icon" className="size-8">
          <FolderPlus />
        </Button>
        <Button variant="secondary" size="icon" className="size-8">
          <FilePlus2 />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroupLabel>Notes</SidebarGroupLabel>
        <SidebarGroupContent>
          <TreeView
            data={data}
            defaultLeafIcon={File}
            defaultNodeIcon={Folder}
          />
          <SidebarMenu></SidebarMenu>
        </SidebarGroupContent>
        <SidebarGroup />
      </SidebarContent>
    </Sidebar>
  );
}
