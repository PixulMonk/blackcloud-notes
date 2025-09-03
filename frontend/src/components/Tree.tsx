import React, { useState } from 'react';
import { ChevronRight, Ellipsis, File, Folder, Plus } from 'lucide-react';

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
import { Input } from './ui/input';

import { type TreeNode } from '../types/tree';

interface TreeeProps {
  data: TreeNode[];
  renamingNodeId: string | null;
  setRenamingNodeId: React.Dispatch<React.SetStateAction<string | null>>;
}

type TreeNodeComponentProps = Pick<
  TreeeProps,
  'renamingNodeId' | 'setRenamingNodeId'
> & {
  node: TreeNode;
};

// Renders individual node components
const TreeNodeComponent = ({
  node,
  renamingNodeId,
  setRenamingNodeId,
}: TreeNodeComponentProps) => {
  const hasChildren = !!node.children?.length;
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [treeData, setTreeData] = useState(node);
  const isRenaming = node._id === renamingNodeId;

  const handleRenameSubmit = () => {
    // TODO: API call here
    setRenamingNodeId(null);
  };

  const Icon = node.icon || (node.type === 'folder' ? Folder : File);

  const Label = (
    <div className="flex items-center">
      {hasChildren && (
        <ChevronRight className="h-4 w-4 mr-2 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
      )}
      <Icon className="h-4 w-4 shrink-0 mr-2" />
      {isRenaming ? (
        <Input
          type="text"
          value={treeData.title}
          onChange={(e) => setTreeData({ ...treeData, title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleRenameSubmit();
            }
          }}
          onBlur={handleRenameSubmit}
          autoFocus
        />
      ) : (
        <span>{treeData.title}</span>
      )}
    </div>
  );

  const Actions = (
    <div className="flex items-center ">
      {hasChildren && (
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

      <DropdownMenu onOpenChange={(open) => setIsMenuOpen(open)}>
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
            className={`flex justify-between w-full px-1.5 rounded-md ${
              isHovered || isMenuOpen ? 'bg-accent/50' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CollapsibleTrigger asChild>{Label}</CollapsibleTrigger>
            <div className={isHovered ? 'opacity-100' : 'opacity-0'}>
              {Actions}
            </div>
          </div>

          <CollapsibleContent>
            <ul className="pl-4 space-y-1.5">
              {node.children!.map((child) => (
                <TreeNodeComponent
                  key={child._id}
                  node={child}
                  renamingNodeId={renamingNodeId}
                  setRenamingNodeId={setRenamingNodeId}
                />
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
          <div className={isHovered ? 'opacity-100' : 'opacity-0'}>
            {Actions}
          </div>
        </div>
      )}
    </div>
  );
};

// TODO: maybe separate Tree and TreeNode as different components
// Handles an array of nodes and passes it to TreeNodeCompoent to be individually rendered
const Tree = ({ data, renamingNodeId, setRenamingNodeId }: TreeeProps) => (
  <ul className="space-y-1.5">
    {data.map((node) => (
      <TreeNodeComponent
        key={node._id}
        node={node}
        renamingNodeId={renamingNodeId}
        setRenamingNodeId={setRenamingNodeId}
      />
    ))}
  </ul>
);

export { Tree, type TreeNode };
