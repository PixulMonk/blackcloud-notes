import { TreeNode, type ITreeNode } from '../models/treeNode.model';
import { Note } from '../models/note.model';

export const deleteNodeChildren = async (
  parentId: string,
  userId: string
): Promise<{ notes: number; nodes: number }> => {
  let notes = 0;
  let nodes = 0;

  const children = await TreeNode.find({ parentId, userId });

  for (const child of children) {
    if (child.type === 'file') {
      const note = await Note.findOneAndDelete({ _id: child.fileId, userId });
      if (note) notes++;
    } else {
      const result = await deleteNodeChildren(child._id.toString(), userId);
      notes += result.notes;
      nodes += result.nodes;
    }

    const node = await TreeNode.findOneAndDelete({ _id: child._id, userId });
    if (node) nodes++;
  }

  return { notes, nodes };
};

// TODO: guardrails against unsafe updates

export const updateNodeAndChildrenRecursively = async (
  nodeId: string,
  userId: string,
  updates: Partial<ITreeNode>
) => {
  await TreeNode.findOneAndUpdate({ _id: nodeId, userId }, { $set: updates });
  const children = await TreeNode.find({ parentId: nodeId, userId });
  for (const child of children) {
    await updateNodeAndChildrenRecursively(
      child._id.toString(),
      userId,
      updates
    );
  }
};
