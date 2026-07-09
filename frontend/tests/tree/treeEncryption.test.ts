import { decryptTree } from '@/lib/tree/treeEncryption';
import { decryptAESGCM } from '@/lib/crypto/aes';
import type { TreeNode, TreeNodeDTO } from '@/types/treeStore.types';

const mockKey = new Uint8Array(32).fill(1);

const mockTreeDTO: TreeNodeDTO[] = [
  {
    _id: 'root-1',
    userId: 'mock-user',
    encryptedTitle: 'encrypted-root-1',
    type: 'folder',
    position: 0,
    children: [
      {
        _id: 'child-1',
        userId: 'mock-user',
        encryptedTitle: 'encrypted-child-1',
        type: 'file',
        position: 0,
        children: [],
      },
    ],
  },
  {
    _id: 'root-2',
    userId: 'mock-user',
    encryptedTitle: 'encrypted-root-2',
    type: 'file',
    position: 1,
    children: [],
  },
];

vi.mock('@/lib/crypto/aes', () => ({
  decryptAESGCM: vi.fn((encrypted: string) =>
    // Return predictable decrypted title based on input; remove "encrypted-" on the title
    // Easy readability
    Promise.resolve(encrypted.replace('encrypted-', '')),
  ),
}));

describe('Tree Encryption Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decryptTree', () => {
    test('nodes are decrypted recursively', async () => {
      const result = await decryptTree(mockTreeDTO, mockKey);

      const crawlTree = (tree: TreeNode[]) => {
        for (const node of tree) {
          if (node.children) crawlTree(node.children);
          expect(node.title).not.toContain('encrypted-');
        }
      };
      crawlTree(result);
    });

    test('decryptAESGCM is called for every node', async () => {
      await decryptTree(mockTreeDTO, mockKey);

      expect(decryptAESGCM).toHaveBeenCalledTimes(3);
    });

    test('returns correct shape', async () => {
      const result = await decryptTree(mockTreeDTO, mockKey);

      expect(result).toMatchObject([
        {
          _id: 'root-1',
          title: 'root-1',
          type: 'folder',
          children: [
            {
              _id: 'child-1',
              title: 'child-1',
              type: 'file',
            },
          ],
        },
        {
          _id: 'root-2',
          title: 'root-2',
          type: 'file',
        },
      ]);
    });

    test('handles empty array', async () => {
      const result = await decryptTree([], mockKey);
      expect(result).toEqual([]);
    });

    test('nodes without children return empty children array', async () => {
      const result = await decryptTree(mockTreeDTO, mockKey);
      expect(result[1].children).toEqual([]);
    });

    test('does not modify other node fields (id, type, etc)', async () => {
      const result = await decryptTree(mockTreeDTO, mockKey);

      // Note: subject to change
      const nonEncryptedFields: Exclude<keyof TreeNode, 'title'>[] = [
        '_id',
        'userId',
        'type',
        'position',
        'createdAt',
        'isArchived',
        'isDeleted',
        'icon',
        'parentId',
        'fileId',
        'children',
      ];

      const compareTree = (tree: TreeNode[], original: TreeNodeDTO[]) => {
        for (let i = 0; i < tree.length; i++) {
          const node = tree[i];
          const originalNode = original[i];

          for (const field of nonEncryptedFields) {
            if (field === 'children') continue; // children shape changes
            expect(node[field]).toEqual(
              originalNode[field as keyof TreeNodeDTO],
            );
          }

          if (node.children?.length) {
            compareTree(node.children, originalNode.children ?? []);
          }
        }
      };

      compareTree(result, mockTreeDTO);
    });
  });
});
