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
import { useTreeUI, useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';
import { useAppStoreActions } from '@/store/useAppStore';

// Renders individual node components
const TreeNodeComponent = ({ node }: TreeNodeComponentProps) => {
  const hasChildren = !!node.children?.length;
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [treeData, setTreeData] = useState(node);

  const { setActiveView } = useAppStoreActions();
  const { renamingNodeId, selectedNodeId } = useTreeUI();
  const { setRenamingNodeId, setFileTitle, selectNode } = useTreeUIActions();

  const isRenaming = node._id === renamingNodeId;
  const isSelected = node._id === selectedNodeId;
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateNode } = useDataActions();

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
      setIsMenuOpen={setIsMenuOpen}
      onExpand={() => setIsOpen(true)}
    />
  );

  return (
    <div className="w-full px-1.5">
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div
            className={`flex justify-between w-full px-1.5 rounded-md 
              ${isSelected && isHovered ? 'bg-accent' : ''}
              ${isSelected && !isHovered ? 'bg-accent/50' : ''}
              ${!isSelected && (isHovered || isMenuOpen) ? 'bg-accent/30' : ''}
              `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
              selectNode(node);
              setActiveView({ type: 'editor' });
            }}
          >
            <CollapsibleTrigger asChild>
              <div className="group flex items-center">
                {hasChildren && (
                  <ChevronRight className="h-4 w-4 mr-2 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                )}
                {Label}
              </div>
            </CollapsibleTrigger>
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
          onClick={() => {
            selectNode(node);
            setActiveView({ type: 'editor' });
          }}
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
