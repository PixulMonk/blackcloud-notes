import { create } from 'zustand';
import axios from 'axios';
import { type TreeNode, type AddNodeResponse } from '../types/tree';
import { type NoteDTO } from '@/types/note';
import { type EncryptedData } from '@/types/encryption';
import { encryptAESGCM } from '@/lib/crypto/aes';
import { toBase64 } from '@/lib/crypto/crypto-utils';

const BASE_URL = 'http://localhost:3000/api';
axios.defaults.withCredentials = true;

// TODO: error toast?

interface DataState {
  tree: TreeNode[];
  isLoading: boolean;
  isFetchingContent: boolean;
  isSyncing: boolean;
  error: string | null;

  fetchTree: () => Promise<void>;
  setSyncing: (value: boolean) => void;
  addNode: (
    type: 'folder' | 'file',
    dataEncryptionKey: Uint8Array,
    title?: EncryptedData,
    isArchived?: boolean,
    isDeleted?: boolean,
    icon?: string | undefined,
    parentId?: string | null,
  ) => Promise<TreeNode | null>;
  updateNode: (
    id: string,
    title?: string | undefined,
    type?: 'folder' | 'file',
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
    encryptedContent: EncryptedData,
    fileId: string,
  ) => Promise<NoteDTO | null>;
}

export const useDataStore = create<DataState>((set) => ({
  tree: [],
  isLoading: false,
  isFetchingContent: false,
  isSyncing: false,
  error: null,

  fetchTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<{ success: boolean; tree: TreeNode[] }>(
        `${BASE_URL}/tree/build`,
      );
      set({ tree: response.data.tree, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tree', isLoading: false });
    }
  },
  setSyncing: (value) => set({ isSyncing: value }),

  addNode: async (
    type,
    dataEncryptionKey,
    encryptedTitle = undefined,
    isArchived = false,
    isDeleted = false,
    icon = undefined,
    parentId = null,
  ) => {
    set({ isLoading: true, error: null });
    if (!encryptedTitle) {
      const placeHolderTitle = new TextEncoder().encode('Untitled document');
      const { ciphertext, iv, authTag } = await encryptAESGCM(
        placeHolderTitle,
        dataEncryptionKey!,
      );

      encryptedTitle = {
        ciphertext: toBase64(ciphertext),
        iv: toBase64(iv),
        authTag: toBase64(authTag),
      };
    }
    try {
      const response = await axios.post<AddNodeResponse>(
        `${BASE_URL}/treeNodes/create`,
        {
          encryptedTitle,
          type,
          isArchived,
          isDeleted,
          icon,
          parentId,
        },
      );

      const newNode = response.data.data;

      set((state) => ({
        tree: [...state.tree, newNode],
        isLoading: false,
      }));

      return newNode;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error creating node',
          isLoading: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return null;
    }
  },

  updateNode: async (
    nodeId,
    title,
    type,
    isArchived,
    isDeleted,
    icon,
    parentId,
    fileId,
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch<AddNodeResponse>(
        `${BASE_URL}/treeNodes/${nodeId}`,
        {
          title,
          type,
          isArchived,
          isDeleted,
          icon,
          parentId,
          fileId,
        },
      );

      const updatedNode = response.data.data;

      set((state) => ({
        tree: state.tree.map((n) =>
          n._id === nodeId ? { ...n, ...updatedNode } : n,
        ),
        isLoading: false,
      }));

      await useDataStore.getState().fetchTree();
      return updatedNode;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error updating node',
          isLoading: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return null;
    }
  },

  // TODO: soft delete and archive have some repetitive code
  // TODO: Drink a gallon of coffee and combine into recursive update instead

  softDeleteNode: async (nodeId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch<AddNodeResponse>(
        `${BASE_URL}/treeNodes/${nodeId}/soft-delete`,
      );

      const updatedNode = response.data.data;

      set((state) => ({
        tree: state.tree.map((n) =>
          n._id === nodeId ? { ...n, ...updatedNode } : n,
        ),
        isLoading: false,
      }));

      await useDataStore.getState().fetchTree();
      return updatedNode;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error updating node',
          isLoading: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return null;
    }
  },

  archiveNode: async (nodeId) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch<AddNodeResponse>(
        `${BASE_URL}/treeNodes/${nodeId}/archive`,
      );

      const updatedNode = response.data.data;

      set((state) => ({
        tree: state.tree.map((n) =>
          n._id === nodeId ? { ...n, ...updatedNode } : n,
        ),
        isLoading: false,
      }));

      await useDataStore.getState().fetchTree();
      return updatedNode;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error updating node',
          isLoading: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isLoading: false });
      }
      return null;
    }
  },

  fetchNodeContent: async (fileId) => {
    set({ isFetchingContent: true, error: null });

    try {
      const response = await axios.get(`${BASE_URL}/notes/${fileId}`);
      set({ isFetchingContent: false });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error fetching node content',
          isFetchingContent: false,
        });
      } else {
        set({
          error: 'An unexpected error occurred',
          isFetchingContent: false,
        });
      }
      return null;
    }
  },
  updateNote: async (encryptedContent, fileId) => {
    set({ error: null });
    try {
      // TODO: update to match backend
      const response = await axios.patch(`${BASE_URL}/notes/${fileId}`, {
        encryptedContent,
      });
      set({ isSyncing: false });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        set({
          error: error.response?.data?.message || 'Error updating node content',
          isSyncing: false,
        });
      } else {
        set({ error: 'An unexpected error occurred', isSyncing: false });
      }
      return null;
    }
  },
}));
