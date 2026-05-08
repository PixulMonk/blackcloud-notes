import { useNavigate } from 'react-router-dom';
import { useDataActions } from '@/store/useDataStore';
import { useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';

const useCreateNode = () => {
  const navigate = useNavigate();
  const { addNode } = useDataActions();
  const { setRenamingNodeId } = useTreeUIActions();
  const dataEncryptionKey = useDataEncryptionKey();

  const createNode = async (type: 'folder' | 'file') => {
    if (!dataEncryptionKey) {
      navigate('/unlock-vault', { state: { from: location.pathname } });
      return;
    }
    const newNode = await addNode(type, dataEncryptionKey);
    if (newNode?._id) {
      setRenamingNodeId(newNode._id);
    }
  };

  return { createNode };
};

export default useCreateNode;
