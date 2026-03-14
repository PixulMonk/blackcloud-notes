import { useState, useEffect, useRef } from 'react';
import { useTreeUIStore } from '@/store/useTreeUIStore';
import { Input } from './ui/input';
import { useDataStore } from '@/store/useDataStore';

export const DocumentTitle = () => {
  const [isRenaming, setIsRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedNodeId = useTreeUIStore((state) => state.selectedNodeId);
  const selectedFileTitle = useTreeUIStore((state) => state.selectedFileTitle);
  const [previousTitle, setPreviousTitle] = useState(selectedFileTitle);
  const setFileTitle = useTreeUIStore((state) => state.setFileTitle);
  const updateNode = useDataStore((state) => state.updateNode);

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
    if (!selectedNodeId || selectedFileTitle === null) return;

    if (selectedFileTitle !== previousTitle) {
      updateNode(selectedNodeId, selectedFileTitle);
      setPreviousTitle(selectedFileTitle);
      console.log('update sent to db');
    }

    setIsRenaming(false);
  };

  return (
    <div className="mx-4" onClick={() => setIsRenaming(true)}>
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
          className="w-full text-4xl font-bold"
        />
      ) : (
        <h1 className="text-4xl font-bold">{selectedFileTitle}</h1>
      )}
    </div>
  );
};
