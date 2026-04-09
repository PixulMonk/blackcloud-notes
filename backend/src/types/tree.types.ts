import { TreeNode, ITreeNode } from '../models/treeNode.model';
import { SimpleResponse } from './common.types';

export interface TreeNodeWithChildren extends ITreeNode {
  children?: TreeNodeWithChildren[];
}
export interface TreeResponse extends SimpleResponse {
  tree?: TreeNodeWithChildren[];
}
