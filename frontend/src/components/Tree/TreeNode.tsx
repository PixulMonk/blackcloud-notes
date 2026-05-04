import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import NodeActions from './node-components/NodeActions';
import NodeLabel from './node-components/NodeLabel';
import { type TreeNodeComponentProps } from '../../types/treeStore.types';
import { useDataActions } from '@/store/useDataStore';
import { confirm } from '../ConfirmDialogue';

import { useTreeUI, useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';

// Renders individual node components
const TreeNodeComponent = ({ node }: TreeNodeComponentProps) => {
  const hasChildren = !!node.children?.length;
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [treeData, setTreeData] = useState(node);

  const { renamingNodeId, selectedNodeId } = useTreeUI();
  const { setRenamingNodeId, setFileTitle, selectNode } = useTreeUIActions();

  const isRenaming = node._id === renamingNodeId;
  const isSelected = node._id === selectedNodeId;
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateNode, softDeleteNode, archiveNode } = useDataActions();

  const dataEncryptionKey = useDataEncryptionKey();

  const handleRenameSubmit = () => {
    if (!dataEncryptionKey) return;
    if (!renamingNodeId) return;

    // Don't re-encrypt if title hasn't changed
    if (treeData.title === node.title) {
      setRenamingNodeId(null);
      return;
    }

    updateNode(renamingNodeId, dataEncryptionKey, treeData.title);
    setFileTitle(treeData.title);
    setRenamingNodeId(null);
  };

  useEffect(() => {
    setTreeData(node);
  }, [node]);

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
      title: 'Archive',
      message: 'Are you sure you want to delete this item?',
      yesText: 'Delete',
      noText: 'Cancel',
    });
    if (ok) softDeleteNode(id);
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
            className={`flex justify-between w-full px-1.5 rounded-md 
              ${isSelected && isHovered ? 'bg-accent' : ''}
              ${isSelected && !isHovered ? 'bg-accent/50' : ''}
              ${!isSelected && (isHovered || isMenuOpen) ? 'bg-accent/30' : ''}
              `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => selectNode(node)}
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
          className={`flex justify-between items-center p-1 rounded-md group 
              ${isSelected && isHovered ? 'bg-accent' : ''}
              ${isSelected && !isHovered ? 'bg-accent/50' : ''}
              ${!isSelected && isHovered ? 'bg-accent/30' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => selectNode(node)}
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
