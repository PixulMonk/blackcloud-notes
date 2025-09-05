// TODO: put tree types here. Also put other types in the types dir for better org

export interface TreeNode {
  _id: string;
  userId: string;
  title: string;
  type: 'folder' | 'file';
  position: number;
  isArchived?: boolean;
  isDeleted?: boolean;
  icon?: string;
  parentId?: string | null;
  fileId?: string;
  children?: TreeNode[];
}

interface AddNodeResponse {
  success: boolean;
  message: string;
  data: TreeNode;
}
