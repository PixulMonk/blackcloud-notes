import { useState, useEffect, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { useTreeUI, useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';
import { Input } from '../ui/input';
import { useDataActions } from '@/store/useDataStore';

export const DocumentTitle = () => {
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { selectedNodeId, selectedFileTitle, selectedNode } = useTreeUI();
  const { setFileTitle } = useTreeUIActions();
  const [previousTitle, setPreviousTitle] = useState(selectedFileTitle);

  const dataEncryptionKey = useDataEncryptionKey();
  const { updateNode } = useDataActions();

  useEffect(() => {
    setPreviousTitle(selectedFileTitle || '');
  }, [selectedNodeId]);

  useEffect(() => {
    if (isRenaming) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isRenaming]);

  if (!selectedNodeId) return null;

  const handleUpdate = () => {
    if (!selectedNode?._id || selectedFileTitle === null) return;

    if (selectedFileTitle !== previousTitle && dataEncryptionKey) {
      updateNode(selectedNode._id, dataEncryptionKey, selectedFileTitle); // use _id, not selectedNodeId
      setPreviousTitle(selectedFileTitle);
      console.log('update sent to db');
    }

    setIsRenaming(false);
  };

  return (
    <div
      className="flex items-center min-w-0"
      onClick={() => setIsRenaming(true)}
    >
      {isRenaming ? (
        <Input
          ref={inputRef}
          type="text"
          value={selectedFileTitle || ''}
          onChange={(e) => setFileTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleUpdate();
          }}
          onBlur={handleUpdate}
          className="h-7 w-auto min-w-[120px] text-sm font-semibold focus-visible:ring-1"
        />
      ) : (
        <div className="flex items-center gap-2 group cursor-pointer px-2 py-1 rounded-md border border-transparent hover:border-border/50 hover:bg-accent/10 transition-all">
          <h1 className="text-sm font-semibold truncate max-w-[200px]">
            {selectedFileTitle}
          </h1>
          <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
        </div>
      )}
    </div>
  );
};
