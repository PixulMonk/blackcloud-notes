import { useNavigate } from 'react-router-dom';
import { useDataActions } from '@/store/useDataStore';
import { useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';

const useCreateNode = () => {
  const navigate = useNavigate();
  const { addNode } = useDataActions();
  const { setRenamingNodeId } = useTreeUIActions();
  const dataEncryptionKey = useDataEncryptionKey();

  const createNode = async (
    type: 'folder' | 'file',
    parentId: string | undefined,
  ) => {
    if (!dataEncryptionKey) {
      navigate('/unlock-vault', { state: { from: location.pathname } });
      return;
    }
    console.log('createNode called with parentId:', parentId);
    const newNode = await addNode({ type, dataEncryptionKey, parentId });
    if (newNode?._id) {
      setRenamingNodeId(newNode._id);
    }
  };

  return { createNode };
};

export default useCreateNode;
