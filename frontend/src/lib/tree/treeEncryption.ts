import type { TreeNode, TreeNodeDTO } from "@/types/treeStore.types";

import { decryptAESGCM } from "@/lib/crypto/aes";

export const decryptTree = async (
  nodes: TreeNodeDTO[],
  key: Uint8Array,
): Promise<TreeNode[]> => {
  return Promise.all(
    nodes.map(async (node: TreeNodeDTO) => {
      let decryptedTitle: string;
      try {
        decryptedTitle = await decryptAESGCM(node.encryptedTitle, key);
      } catch {
        decryptedTitle = "[Corrupted title]";
      }

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
