import {
  updateRecursive,
  removeRecursive,
  insertNode,
  sortTree,
  moveNode,
} from '@/lib/tree/treeHelpers';
import { makeNode } from '@/utils/testHelpers';

describe('Tree Helper Functions', () => {
  // -------------------------
  // updateRecursive
  // -------------------------
  describe('updateRecursive', () => {
    test('updates a node at the root level', () => {
      const nodes = [makeNode({ _id: 'node-1', title: 'Old Title' })];
      const result = updateRecursive(nodes, 'node-1', { title: 'New Title' });

      expect(result[0].title).toBe('New Title');
    });
    test('updates a node nested deep in the tree', () => {
      const nodes = [
        makeNode({
          _id: 'root-node',
          children: [
            makeNode({
              _id: 'branch-node',
              children: [makeNode({ _id: 'leaf-node', title: 'Old Title' })],
            }),
          ],
        }),
      ];

      const result = updateRecursive(nodes, 'leaf-node', {
        title: 'New Title',
      });

      const leafNode = result[0].children![0].children![0];

      expect(leafNode.title).toBe('New Title');
    });

    test('does not modify other nodes', () => {
      const nodes = [
        makeNode({ _id: 'node-1', title: 'Node 1' }),
        makeNode({ _id: 'node-2', title: 'Node 2' }),
      ];

      const result = updateRecursive(nodes, 'node-1', {
        title: 'Updated Title',
      });

      expect(result[1].title).toBe('Node 2');
    });

    test('ignores children in updatedFields', () => {
      const originalChildren = [makeNode({ _id: 'child-1' })];
      const nodes = [makeNode({ _id: 'node-1', children: originalChildren })];

      const result = updateRecursive(nodes, 'node-1', {
        title: 'Updated',
        children: [makeNode({ _id: 'injected-child' })],
      });

      // children should remain unchanged
      expect(result[0].children).toEqual(originalChildren);
      expect(result[0].title).toBe('Updated');
    });
  });

  // -------------------------
  // removeRecursive
  // -------------------------
  describe('removeRecursive', () => {
    test('removes a node at the root level', () => {
      const nodes = [makeNode({ _id: 'node-1' }), makeNode({ _id: 'node-2' })];

      const result = removeRecursive(nodes, 'node-1');

      expect(result).toHaveLength(1);
      expect(result[0]._id).toBe('node-2');
    });

    test('removes a node nested deep in the tree', () => {
      const nodes = [
        makeNode({
          _id: 'parent',
          children: [makeNode({ _id: 'child-to-remove' })],
        }),
      ];

      const result = removeRecursive(nodes, 'child-to-remove');

      expect(result[0].children).toHaveLength(0);
    });

    test('does not remove other nodes', () => {
      const nodes = [makeNode({ _id: 'node-1' }), makeNode({ _id: 'node-2' })];

      const result = removeRecursive(nodes, 'node-1');

      expect(result.find((n) => n._id === 'node-2')).toBeDefined();
    });

    test('returns empty array when last node is removed', () => {
      const nodes = [makeNode({ _id: 'node-1' })];
      const result = removeRecursive(nodes, 'node-1');

      expect(result).toHaveLength(0);
    });
  });

  // -------------------------
  // insertNode
  // -------------------------
  describe('insertNode', () => {
    test('inserts a node under the correct parent', () => {
      const nodes = [makeNode({ _id: 'node-1' }), makeNode({ _id: 'node-2' })];
      const newNode = makeNode({ _id: 'inserted-node' });
      const result = insertNode(nodes, 'node-1', newNode);

      expect(result[0].children).toHaveLength(1);
      expect(result[0].children![0]._id).toBe('inserted-node');
      expect(result[0].children![0].parentId).toBe('node-1'); // add this
    });

    test('inserts into nested parent', () => {
      const nodes = [
        makeNode({
          _id: 'root',
          children: [makeNode({ _id: 'nested-parent', children: [] })],
        }),
      ];
      const newNode = makeNode({ _id: 'deep-child' });

      const result = insertNode(nodes, 'nested-parent', newNode);

      expect(result[0].children![0].children).toHaveLength(1);
      expect(result[0].children![0].children![0]._id).toBe('deep-child');
    });

    test('returns unchanged tree if parentId not found', () => {
      const nodes = [makeNode({ _id: 'node-1' })];
      const newNode = makeNode({ _id: 'new-node' });

      const result = insertNode(nodes, 'non-existent', newNode);

      expect(result).toEqual(nodes);
    });
  });

  // -------------------------
  // sortTree
  // -------------------------
  describe('sortTree', () => {
    test('folders always appear before files', () => {
      const nodes = [
        makeNode({ _id: 'file-1', type: 'file', title: 'A File' }),
        makeNode({ _id: 'folder-1', type: 'folder', title: 'Z Folder' }),
      ];

      const result = sortTree(nodes);

      expect(result[0].type).toBe('folder');
      expect(result[1].type).toBe('file');
    });

    test('sorts alphabetically ascending by default', () => {
      const nodes = [
        makeNode({ _id: 'node-b', type: 'folder', title: 'B' }),
        makeNode({ _id: 'node-a', type: 'folder', title: 'A' }),
        makeNode({ _id: 'node-c', type: 'folder', title: 'C' }),
      ];

      const result = sortTree(nodes);

      expect(result[0].title).toBe('A');
      expect(result[1].title).toBe('B');
      expect(result[2].title).toBe('C');
    });

    test('sorts alphabetically descending when order is desc', () => {
      const nodes = [
        makeNode({ _id: 'node-a', type: 'folder', title: 'A' }),
        makeNode({ _id: 'node-b', type: 'folder', title: 'B' }),
      ];

      const result = sortTree(nodes, 'alphabetical', 'desc');

      expect(result[0].title).toBe('B');
      expect(result[1].title).toBe('A');
    });

    test('sorts by dateModified', () => {
      const nodes = [
        makeNode({
          _id: 'newer',
          type: 'folder',
          title: 'Newer',
          updatedAt: '2024-02-01',
        }),
        makeNode({
          _id: 'older',
          type: 'folder',
          title: 'Older',
          updatedAt: '2024-01-01',
        }),
      ];

      const result = sortTree(nodes, 'dateModified', 'asc');

      expect(result[0]._id).toBe('older');
      expect(result[1]._id).toBe('newer');
    });

    test('sorts children recursively', () => {
      const nodes = [
        makeNode({
          _id: 'parent',
          type: 'folder',
          title: 'Parent',
          children: [
            makeNode({ _id: 'child-b', type: 'folder', title: 'B' }),
            makeNode({ _id: 'child-a', type: 'folder', title: 'A' }),
          ],
        }),
      ];

      const result = sortTree(nodes);

      expect(result[0].children![0].title).toBe('A');
      expect(result[0].children![1].title).toBe('B');
    });
  });

  // -------------------------
  // moveNode
  // -------------------------
  describe('moveNode', () => {
    test('moves a root node to a new parent', () => {
      const nodes = [
        makeNode({ _id: 'node-to-move', title: 'Mover' }),
        makeNode({ _id: 'new-parent', children: [] }),
      ];

      const result = moveNode(nodes, 'node-to-move', 'new-parent');

      expect(result.find((n) => n._id === 'node-to-move')).toBeUndefined();
      expect(result.find((n) => n._id === 'new-parent')!.children).toHaveLength(
        1,
      );
    });

    test('moves a nested node to root level when newParentId is null', () => {
      const nodes = [
        makeNode({
          _id: 'parent',
          children: [makeNode({ _id: 'child-to-move' })],
        }),
      ];

      const result = moveNode(nodes, 'child-to-move', null);

      expect(result).toHaveLength(2);
      expect(result.find((n) => n._id === 'child-to-move')).toBeDefined();
      expect(result.find((n) => n._id === 'parent')!.children).toHaveLength(0);
    });

    test('moves a nested node to a different parent', () => {
      const nodes = [
        makeNode({
          _id: 'old-parent',
          children: [makeNode({ _id: 'node-to-move' })],
        }),
        makeNode({ _id: 'new-parent', children: [] }),
      ];

      const result = moveNode(nodes, 'node-to-move', 'new-parent');

      expect(result.find((n) => n._id === 'old-parent')!.children).toHaveLength(
        0,
      );
      expect(result.find((n) => n._id === 'new-parent')!.children).toHaveLength(
        1,
      );
    });

    test('returns unchanged tree if nodeId not found', () => {
      const nodes = [makeNode({ _id: 'node-1' })];
      const result = moveNode(nodes, 'non-existent', null);

      expect(result).toEqual(nodes);
    });
  });
});
