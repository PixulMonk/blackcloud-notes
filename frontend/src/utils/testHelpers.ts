import type { TreeNode } from '@/types/treeStore.types';

export const makeNode = (overrides: Partial<TreeNode> = {}): TreeNode => ({
  _id: 'node-1',
  userId: 'mock-user',
  title: 'Test Node',
  type: 'folder',
  position: 0,
  children: [],
  ...overrides,
});
