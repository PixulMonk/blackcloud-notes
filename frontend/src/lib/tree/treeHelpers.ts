import type { TreeNode } from '@/types/tree.types';

export const updateRecursive = (
  nodes: TreeNode[],
  id: string,
  updatedFields: Partial<TreeNode>,
): TreeNode[] => {
  return nodes.map((node) => {
    if (node._id === id) {
      return { ...node, ...updatedFields };
    }
    if (node.children) {
      return {
        ...node,
        children: updateRecursive(node.children, id, updatedFields),
      };
    }
    return node;
  });
};
