import type { TreeNode } from '@/types/treeStore.types';

export const updateRecursive = (
  nodes: TreeNode[],
  nodeIdToUpdate: string,
  updatedFields: Partial<TreeNode>,
): TreeNode[] => {
  return nodes.map((node) => {
    if (node._id === nodeIdToUpdate) {
      return { ...node, ...updatedFields };
    }
    if (node.children) {
      return {
        ...node,
        children: updateRecursive(node.children, nodeIdToUpdate, updatedFields),
      };
    }
    return node;
  });
};

export const removeRecursive = (
  nodes: TreeNode[],
  nodeIdToDelete: string,
): TreeNode[] => {
  return nodes
    .filter((node) => node._id !== nodeIdToDelete)
    .map((node) => ({
      ...node,
      children: node.children
        ? removeRecursive(node.children, nodeIdToDelete)
        : undefined,
    }));
};

export const insertNode = (
  nodes: TreeNode[],
  parentId: string,
  newNode: TreeNode,
): TreeNode[] => {
  return nodes.map((n) => {
    if (n._id === parentId) {
      return { ...n, children: [...(n.children ?? []), newNode] };
    }
    if (n.children?.length) {
      return { ...n, children: insertNode(n.children, parentId, newNode) };
    }
    return n;
  });
};
