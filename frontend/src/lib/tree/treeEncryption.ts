import type { TreeNode, TreeNodeDTO } from '@/types/tree.types';

import { decryptAESGCM } from '@/lib/crypto/aes';

export const decryptTree = async (
  nodes: TreeNodeDTO[],
  key: Uint8Array,
): Promise<TreeNode[]> => {
  return Promise.all(
    nodes.map(async (node: TreeNodeDTO) => {
      console.log('Encrypted Title:', node.encryptedTitle);
      console.log('Raw node from API:', JSON.stringify(node));
      console.log('encryptedTitle type:', typeof node.encryptedTitle);
      console.log('encryptedTitle value:', node.encryptedTitle);
      const decryptedTitle = await decryptAESGCM(node.encryptedTitle, key);

      const decryptedChildren = node.children
        ? await decryptTree(node.children, key)
        : [];

      return {
        ...node,
        title: decryptedTitle,
        children: decryptedChildren,
      } as TreeNode;
    }),
  );
};
