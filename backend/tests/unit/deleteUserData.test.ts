import deleteUserData from '../../src/utils/deleteUserData';
import { TreeNode } from '../../src/models/treeNode.model';
import { Note } from '../../src/models/note.model';

jest.mock('../../src/models/treeNode.model');
jest.mock('../../src/models/note.model');

describe('Delete User Data Utility Function Unit Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('no data found', () => {
    test('completes without error when no data exists', async () => {
      (Note.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
      (TreeNode.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      await expect(deleteUserData('test-user-id')).resolves.not.toThrow();
    });
  });

  describe('database updates', () => {
    test('user data is deleted when found', async () => {
      (Note.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 3 });
      (TreeNode.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 3 });

      await deleteUserData('test-user-id');

      expect(Note.deleteMany as jest.Mock).toHaveBeenCalledTimes(1);
      expect(TreeNode.deleteMany as jest.Mock).toHaveBeenCalledTimes(1);
      expect(Note.deleteMany as jest.Mock).toHaveBeenCalledWith({
        userId: 'test-user-id',
      });
      expect(TreeNode.deleteMany as jest.Mock).toHaveBeenCalledWith({
        userId: 'test-user-id',
      });
    });
  });
});
