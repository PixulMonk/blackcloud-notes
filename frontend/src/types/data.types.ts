import type { TreeNode, TreeNodeDTO } from './treeStore.types';
import type { NoteDTO, NoteResponse } from '@/types/note.types';

export interface DataActions {
  fetchTree: (dataEncryptionKey: Uint8Array) => Promise<void>;
  setSyncing: (value: boolean) => void;
  addNode: (options: AddNodeOptions) => Promise<TreeNodeDTO | null>;
  updateNode: (
    id: string,
    dataEncryptionKey: Uint8Array,
    title?: string | undefined,
    type?: 'folder' | 'file',
    position?: number,
    isArchived?: boolean,
    isDeleted?: boolean,
    icon?: string | undefined,
    parentId?: string | null,
    fileId?: string,
  ) => Promise<TreeNodeDTO | null>;
  softDeleteNode: (nodeId: string) => Promise<TreeNodeDTO | null>;
  archiveNode: (nodeId: string) => Promise<TreeNodeDTO | null>;
  fetchNodeContent: (fileId: string) => Promise<NoteDTO | null>;
  updateNote: (
    encryptedContent: string,
    fileId: string,
  ) => Promise<NoteResponse | null>;
}

export interface DataState {
  tree: TreeNode[];
  isLoading: boolean;
  isFetchingContent: boolean;
  isSyncing: boolean;
  error: string | null;
  actions: DataActions;
}

export type DataStoreState = Omit<DataState, 'actions'>;

export interface TreeNodeResponse {
  success: boolean;
  data: TreeNodeDTO;
}

export interface TreeResponse {
  success: boolean;
  tree: TreeNodeDTO[];
}

export interface AddNodeOptions {
  type: 'folder' | 'file';
  dataEncryptionKey: Uint8Array;
  title?: string;
  isArchived?: boolean;
  isDeleted?: boolean;
  icon?: string;
  parentId?: string | null;
}
