import type { TreeNode, SortPreference } from '@/types/treeStore.types';

export const updateRecursive = (
  nodes: TreeNode[],
  nodeIdToUpdate: string,
  updatedFields: Partial<TreeNode>,
): TreeNode[] => {
  return nodes.map((node) => {
    if (node._id === nodeIdToUpdate) {
      const { children, ...fields } = updatedFields;
      return { ...node, ...fields };
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

// TODO: add manual sort later for drag and drop
export const sortTree = (
  nodes: TreeNode[],
  sortBy: SortPreference['sortBy'] = 'alphabetical',
  sortOrder: SortPreference['order'] = 'asc',
): TreeNode[] => {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...nodes]
    .sort((a, b) => {
      // folders always first regardless of sort
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;

      if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title) * direction;
      }

      if (sortBy === 'dateModified') {
        const aDate = new Date(a.updatedAt ?? 0).getTime();
        const bDate = new Date(b.updatedAt ?? 0).getTime();
        return (aDate - bDate) * direction;
      }

      return 0;
    })
    .map((node) => ({
      ...node,
      children: node.children
        ? sortTree(node.children, sortBy, sortOrder)
        : undefined,
    }));
};
