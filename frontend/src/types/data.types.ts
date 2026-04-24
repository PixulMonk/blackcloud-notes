import type { TreeNode } from '../types/tree.types';
import type { NoteDTO, NoteResponse } from '@/types/note.types';

export interface DataActions {
  fetchTree: () => Promise<void>;
  setSyncing: (value: boolean) => void;
  addNode: (
    type: 'folder' | 'file',
    dataEncryptionKey: Uint8Array,
    title?: string, // Unencrypted title is passed and comes out as encrypted
    isArchived?: boolean,
    isDeleted?: boolean,
    icon?: string | undefined,
    parentId?: string | null,
  ) => Promise<TreeNode | null>;
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
  ) => Promise<TreeNode | null>;
  softDeleteNode: (nodeId: string) => Promise<TreeNode | null>;
  archiveNode: (nodeId: string) => Promise<TreeNode | null>;
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
  data: TreeNode; //| TreeNode[] | null;
}

export interface TreeResponse {
  success: boolean;
  tree: TreeNode[];
}
