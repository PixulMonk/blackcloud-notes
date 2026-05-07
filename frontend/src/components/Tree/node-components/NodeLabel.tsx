import { Input } from '@/components/ui/input';
import { File, Folder } from 'lucide-react';
import { type NodeLabelProps } from '@/types/treeStore.types';

function NodeLabel({
  node,
  isRenaming,
  treeData,
  setTreeData,
  inputRef,
  handleRenameSubmit,
  className,
}: NodeLabelProps) {
  const Icon = node.icon || (node.type === 'folder' ? Folder : File);

  return (
    <div className={`flex items-center ${className || ''}`}>
      <Icon className="h-4 w-4 shrink-0 mr-2" />
      {isRenaming ? (
        <Input
          ref={inputRef}
          type="text"
          value={treeData.title}
          onChange={(e) => setTreeData({ ...treeData, title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRenameSubmit();
          }}
          onBlur={handleRenameSubmit}
        />
      ) : (
        <span>{treeData.title}</span>
      )}
    </div>
  );
}

export default NodeLabel;
