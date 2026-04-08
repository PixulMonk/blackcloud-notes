import type { TreeNode, TreeNodeDTO } from '@/types/tree.types';
import { fromBase64 } from '../crypto/crypto-utils';
import { decryptToString } from '../crypto/stringEncryption';

export const decryptTree = async (
  nodes: TreeNodeDTO[],
  key: Uint8Array,
): Promise<TreeNode[]> => {
  return Promise.all(
    nodes.map(async (node: TreeNodeDTO) => {
      const payload = {
        ciphertext: fromBase64(node.encryptedTitle.ciphertext),
        iv: fromBase64(node.encryptedTitle.iv),
        authTag: fromBase64(node.encryptedTitle.authTag),
      };

      const decryptedTitle = await decryptToString(payload, key);

      const decryptedChildren = node.children
        ? await decryptTree(node.children, key)
        : [];

      return {
        ...node,
        title: decryptedTitle,
        children: decryptedChildren,
      } as TreeNode; // Cast to your UI interface
    }),
  );
};
