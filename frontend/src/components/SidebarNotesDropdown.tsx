import { Ellipsis } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';

import useCreateNode from '@/hooks/useCreateNode';
import { useTreeUI, useTreeUIActions } from '@/store/useTreeUIStore';

function SidebarNotesDropdown() {
  const { createNode } = useCreateNode();

  const { sortPreference } = useTreeUI();
  const { setSortPreference } = useTreeUIActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            createNode('file', undefined);
          }}
        >
          New Note
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            createNode('folder', undefined);
          }}
        >
          New Folder
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Sort by</DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={sortPreference.sortBy === 'alphabetical'}
              onClick={() => setSortPreference({ sortBy: 'alphabetical' })}
            >
              Alphabetical
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={sortPreference.sortBy === 'dateModified'}
              onClick={() => setSortPreference({ sortBy: 'dateModified' })}
            >
              Date Modified
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Order</DropdownMenuSubTrigger>

          <DropdownMenuSubContent>
            <DropdownMenuCheckboxItem
              checked={sortPreference.order === 'asc'}
              onClick={() => setSortPreference({ order: 'asc' })}
            >
              Ascending
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={sortPreference.order === 'desc'}
              onClick={() => setSortPreference({ order: 'desc' })}
            >
              Descending
            </DropdownMenuCheckboxItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default SidebarNotesDropdown;
