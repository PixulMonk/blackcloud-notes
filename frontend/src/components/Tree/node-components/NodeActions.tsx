import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Ellipsis, Plus } from 'lucide-react';

function NodeActions({
  node,
  hasChildren,
  setIsMenuOpen,
  setRenamingNodeId,
  handleSoftDelete,
}: {
  node: any;
  hasChildren: boolean;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  setRenamingNodeId: (id: string) => void;
  handleSoftDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center ">
      {hasChildren && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: dropdown add button handler
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
          onCloseAutoFocus={(e) => e.preventDefault()}
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
