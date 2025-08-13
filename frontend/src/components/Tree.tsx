import React, { useState } from 'react';
import {
  type LucideIcon,
  ChevronRight,
  Ellipsis,
  File,
  Folder,
  Plus,
} from 'lucide-react';

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
  type: 'folder' | 'file';
  children?: TreeNode[];
  actions?: React.ReactNode;
  draggable?: boolean;
  droppable?: boolean;
  disabled?: boolean;
  icon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

// Renders individual node components
const TreeNodeComponent = ({ node }: { node: TreeNode }) => {
  const hasChildren = !!node.children?.length;
  const [isHovered, setIsHovered] = useState(false);

  const Icon = node.icon || (node.type === 'folder' ? Folder : File);

  const Label = (
    <div className="flex items-center">
      {hasChildren && (
        <ChevronRight className="h-4 w-4 mr-2 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
      )}
      <Icon className="h-4 w-4 shrink-0 mr-2" />
      <span>{node.name}</span>
    </div>
  );

  const Actions = (
    <div className="flex items-center ">
      {node.type === 'folder' && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Add"
          onClick={(e) => {
            e.stopPropagation(); // prevent collapse toggle
            /* your add handler */
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

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
  );

  return (
    <div className="w-full">
      {hasChildren ? (
        <Collapsible>
          <div
            className="flex justify-between w-full p-1.5 rounded-md  hover:bg-accent/50 transition-colors duration-200"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CollapsibleTrigger asChild>{Label}</CollapsibleTrigger>
            {isHovered && Actions}
          </div>

          <CollapsibleContent>
            <ul className="pl-4 space-y-1.5">
              {node.children!.map((child) => (
                <TreeNodeComponent key={child.id} node={child} />
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          className="flex justify-between items-center p-1 rounded-md group hover:bg-accent"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {Label}
          {isHovered && Actions}
        </div>
      )}
    </div>
  );
};

// Handles an array of nodes and passes it to TreeNodeCompoent to be individually rendered
const Tree = ({ data }: { data: TreeNode[] }) => (
  <ul className="space-y-1.5">
    {data.map((node) => (
      <TreeNodeComponent key={node.id} node={node} />
    ))}
  </ul>
);

export { Tree, type TreeNode };
