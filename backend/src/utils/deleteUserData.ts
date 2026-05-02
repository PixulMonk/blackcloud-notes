import { TreeNode } from '../models/treeNode.model';
import { Note } from '../models/note.model';

const deleteUserData = async (userId: string) => {
  const [noteResult, treeResult] = await Promise.all([
    Note.deleteMany({ userId }),
    TreeNode.deleteMany({ userId }),
  ]);

  if (noteResult.deletedCount === 0 && treeResult.deletedCount === 0) {
    console.log(`No data found to wipe for userId: ${userId}`);
  } else {
    console.log(
      `Wiped ${noteResult.deletedCount} notes and ${treeResult.deletedCount} nodes for user: ${userId}`,
    );
  }
};

export default deleteUserData;
