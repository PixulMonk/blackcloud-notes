import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import NodeActions from './node-components/NodeActions';
import NodeLabel from './node-components/NodeLabel';
import { type TreeNodeComponentProps } from '../../types/tree';
import { useDataStore } from '@/store/useDataStore';
import { confirm } from '../ConfirmDialogue';

import { useTreeUIStore } from '@/store/useTreeUIStoreI';

// Renders individual node components
const TreeNodeComponent = ({ node }: TreeNodeComponentProps) => {
  const hasChildren = !!node.children?.length;
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [treeData, setTreeData] = useState(node);

  const renamingNodeId = useTreeUIStore((state) => state.renamingNodeId);
  const setRenamingNodeId = useTreeUIStore((state) => state.setRenamingNodeId);
  const isRenaming = node._id === renamingNodeId;

  const inputRef = useRef<HTMLInputElement>(null);

  const updateNode = useDataStore((state) => state.updateNode);
  const softDeleteNode = useDataStore((state) => state.softDeleteNode);
  const archiveNode = useDataStore((state) => state.archiveNode);

  const handleRenameSubmit = () => {
    if (renamingNodeId) {
      updateNode(renamingNodeId, treeData.title);
    }
    setRenamingNodeId(null);
  };

  useEffect(() => {
    if (isRenaming) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isRenaming]);

  const handleSoftDelete = async (id: string) => {
    const ok = await confirm({
      message: 'Are you sure you want to delete this item?',
      yesText: 'Delete',
      noText: 'Cancel',
    });
    if (ok) softDeleteNode(id);
  };

  const handleArchive = async (id: string) => {
    const ok = await confirm({
      message: 'Are you sure you want to archive this item?',
      yesText: 'Archive',
      noText: 'Cancel',
    });
    if (ok) archiveNode(id);
  };

  const Label = (
    <NodeLabel
      className="group"
      node={node}
      isRenaming={isRenaming}
      treeData={treeData}
      setTreeData={setTreeData}
      inputRef={inputRef}
      handleRenameSubmit={handleRenameSubmit}
    />
  );

  const Actions = (
    <NodeActions
      node={node}
      hasChildren={hasChildren}
      isMenuOpen={isMenuOpen}
      setIsMenuOpen={setIsMenuOpen}
      setRenamingNodeId={setRenamingNodeId}
      handleSoftDelete={handleSoftDelete}
    />
  );

  return (
    <div className="w-full px-1.5">
      {hasChildren ? (
        <Collapsible>
          <div
            className={`flex justify-between w-full px-1.5 rounded-md ${
              isHovered || isMenuOpen ? 'bg-accent/50' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center">
                {hasChildren && (
                  <ChevronRight className="h-4 w-4 mr-2 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                )}
                {!isRenaming && <span>{treeData.title}</span>}
              </div>
            </CollapsibleTrigger>
            {isRenaming && Label}
            <div
              className={isHovered || isRenaming ? 'opacity-100' : 'opacity-0'}
            >
              {Actions}
            </div>
          </div>

          <CollapsibleContent>
            <ul className="pl-4 space-y-1.5">
              {node.children!.map((child) => (
                <TreeNodeComponent key={child._id} node={child} />
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
          <div
            className={isHovered || isRenaming ? 'opacity-100' : 'opacity-0'}
          >
            {Actions}
          </div>
        </div>
      )}
    </div>
  );
};

export { TreeNodeComponent };
