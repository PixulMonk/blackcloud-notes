import { Folder, File, ChevronRight, Plus, Ellipsis } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Button } from './ui/button';

interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

const TreeNodeComponent = ({ node }: { node: TreeNode }) => {
  const hasChildren = !!node.children?.length;

  return (
    <div className="w-full">
      {hasChildren ? (
        <Collapsible>
          <CollapsibleTrigger className="flex justify-between w-full p-1.5 rounded-md hover:bg-accent/50 transition-colors duration-200">
            <div className="flex items-center">
              <ChevronRight className="h-4 w-4 mr-2 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
              <Folder className="h-4 w-4 shrink-0 mr-2" />
              <span>{node.name}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center">
              {/* Add button */}
              <Button
                variant="ghost"
                size="icon"
                aria-label="Add"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the collapsible from toggling when clicking the button.
                  /* your add handler */
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>

              {/* Dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Ellipsis className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CollapsibleTrigger>

          {/* Children */}
          <CollapsibleContent>
            <ul className="space-y-1.5">
              {node.children!.map((child) => (
                <li className="pl-4">
                  <TreeNodeComponent key={child.id} node={child} />
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <span className="flex items-center p-1 rounded-md hover:bg-accent">
          <File className="h-4 w-4 shrink-0 mr-2" />
          {node.name}
        </span>
      )}
    </div>
  );
};

const Tree = ({ data }: { data: TreeNode[] }) => (
  <ul className="space-y-1.5">
    {data.map((node) => (
      <TreeNodeComponent key={node.id} node={node} />
    ))}
  </ul>
);

export { Tree, type TreeNode };
