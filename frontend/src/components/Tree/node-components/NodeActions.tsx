import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Plus } from 'lucide-react';
import { confirm } from '../../ConfirmDialogue';
import { useTreeUIActions, useTreeUI } from '@/store/useTreeUIStore';
import { useDataActions } from '@/store/useDataStore';
import type { TreeNode } from '@/types/treeStore.types';
import useCreateNode from '@/hooks/useCreateNode';

function NodeActions({
  node,
  hasChildren,
  setIsMenuOpen,
}: {
  node: TreeNode;
  hasChildren: boolean;
  setIsMenuOpen: (open: boolean) => void;
}) {
  const { setRenamingNodeId, clearSelection } = useTreeUIActions();
  const { selectedNode } = useTreeUI();
  const { softDeleteNode, archiveNode } = useDataActions();
  const { createNode } = useCreateNode();

  const handleSoftDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete',
      message: 'Are you sure you want to delete this item?',
      yesText: 'Delete',
      noText: 'Cancel',
    });
    if (ok) {
      softDeleteNode(id);
      if (selectedNode?._id === id) clearSelection();
    }
  };

  const handleArchive = async (id: string) => {
    const ok = await confirm({
      title: 'Archive',
      message: 'Are you sure you want to archive this item?',
      yesText: 'Archive',
      noText: 'Cancel',
    });
    if (ok) archiveNode(id);
  };

  return (
    <div className="flex items-center ">
      {hasChildren && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add"
          onClick={(e) => {
            e.stopPropagation();
            createNode('file', node._id);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

      <DropdownMenu onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex flex-col p-2"
          onCloseAutoFocus={(e) => e.preventDefault()} // This is what solved Radix' focusing issue
        >
          <DropdownMenuItem
            className="py-1 px-2"
            onClick={() => setRenamingNodeId(node._id)}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="py-1 px-2"
            onClick={() => handleSoftDelete(node._id)}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default NodeActions;
