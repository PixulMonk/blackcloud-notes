import { create } from 'zustand';
import axios from 'axios';
import type {
  DataActions,
  DataState,
  DataStoreState,
  TreeNodeResponse,
  TreeResponse,
} from '@/types/data.types';
import { axiosInstance } from '@/lib/axios';

import { useShallow } from 'zustand/react/shallow';

import type { NoteResponse } from '@/types/note.types';
import type { TreeNode } from '@/types/tree.types';
import { encryptAESGCM } from '@/lib/crypto/aes';
import { decryptTree } from '@/lib/tree/treeEncryption';
import { updateRecursive } from '@/lib/tree/treeHelpers';

// TODO: error toast?

// TODO: There seems to be some separation of concerns issue in these zustand actions
// The zustand actions role should merely be to make a call to the backend to update the DB
// Encryption and decryption happens outside of this actions to avoid debug nightmare
const useDataStore = create<DataState>((set) => ({
  tree: [], // Should be decrypted
  isLoading: false,
  isFetchingContent: false,
  isSyncing: false,
  error: null,
  actions: {
    fetchTree: async (dataEncryptionKey) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosInstance.get<TreeResponse>(`tree/build`);
        const decryptedTree = await decryptTree(
          response.data.tree,
          dataEncryptionKey,
        );
        set({ tree: decryptedTree, isLoading: false });
      } catch (err: any) {
        set({ error: err.message || 'Failed to fetch tree', isLoading: false });
      }
    },

    setSyncing: (value) => set({ isSyncing: value }),

    addNode: async (
      type,
      dataEncryptionKey,
      title = undefined,
      isArchived = false,
      isDeleted = false,
      icon = undefined,
      parentId = null,
    ) => {
      set({ isLoading: true, error: null });
      if (!title) {
        title = 'Untitled document';
      }
      const encryptedTitle = await encryptAESGCM(title, dataEncryptionKey!);

      try {
        console.log('Sending encryptedTitle:', encryptedTitle);

        const response = await axiosInstance.post<TreeNodeResponse>(
          `treeNodes/create`,
          {
            encryptedTitle,
            type,
            isArchived,
            isDeleted,
            icon,
            parentId,
          },
        );

        const newNodeDTO = response.data.data;
        const newNode: TreeNode = {
          ...newNodeDTO,
          title: title,
          children: [],
        };

        set((state) => ({
          tree: [...state.tree, newNode],
          isLoading: false,
        }));

        return newNodeDTO;
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

    // TODO: maybe change this action to accept updates as objects for cleaner code
    updateNode: async (
      nodeId,
      dataEncryptionKey,
      title,
      type,
      position,
      isArchived,
      isDeleted,
      icon,
      parentId,
      fileId,
    ) => {
      set({ isLoading: true, error: null });

      try {
        const payload: any = {};
        if (type !== undefined) payload.type = type;
        if (position !== undefined) payload.position = position;
        if (isArchived !== undefined) payload.isArchived = isArchived;
        if (isDeleted !== undefined) payload.isDeleted = isDeleted;
        if (icon !== undefined) payload.icon = icon;
        if (parentId !== undefined) payload.parentId = parentId;
        if (fileId !== undefined) payload.fileId = fileId;

        // 1. Encrypt title
        if (title !== undefined) {
          payload.encryptedTitle = await encryptAESGCM(
            title,
            dataEncryptionKey,
          );
        }

        const response = await axiosInstance.patch<TreeNodeResponse>(
          `treeNodes/${nodeId}`,
          payload,
        );

        const updatedNodeDTO = response.data.data;

        if (!updatedNodeDTO) {
          throw new Error('Invalid server response when updating node');
        }

        set((state) => ({
          tree: updateRecursive(state.tree, nodeId, {
            ...updatedNodeDTO,
            title: title !== undefined ? title : undefined,
            children: undefined,
          }).map((n) => {
            return n;
          }),
          isLoading: false,
        }));
        return updatedNodeDTO;
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
        const response = await axiosInstance.patch<TreeNodeResponse>(
          `treeNodes/${nodeId}/soft-delete`,
        );

        const updatedNodeDTO = response.data.data;

        set((state) => ({
          tree: updateRecursive(state.tree, nodeId, {
            ...updatedNodeDTO,
            title: undefined,
            children: undefined,
          }).map((n) => {
            return n;
          }),
          isLoading: false,
        }));

        return updatedNodeDTO;
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
        const response = await axiosInstance.patch<TreeNodeResponse>(
          `treeNodes/${nodeId}/archive`,
        );

        const updatedNodeDTO = response.data.data;

        set((state) => ({
          tree: updateRecursive(state.tree, nodeId, {
            ...updatedNodeDTO,
            title: undefined,
            children: undefined,
          }).map((n) => {
            return n;
          }),
          isLoading: false,
        }));

        return updatedNodeDTO;
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
        const response = await axiosInstance.get<NoteResponse>(
          `notes/${fileId}`,
        );
        set({ isFetchingContent: false });
        return response.data.note;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          set({
            error:
              error.response?.data?.message || 'Error fetching node content',
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
        const response = await axiosInstance.patch<NoteResponse>(
          `notes/${fileId}`,
          {
            encryptedContent,
          },
        );
        set({ isSyncing: false });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          set({
            error:
              error.response?.data?.message || 'Error updating node content',
            isSyncing: false,
          });
        } else {
          set({ error: 'An unexpected error occurred', isSyncing: false });
        }
        return null;
      }
    },
  },
}));

export const useData = (): DataStoreState =>
  useDataStore(
    useShallow((s) => ({
      tree: s.tree,
      isLoading: s.isLoading,
      isFetchingContent: s.isFetchingContent,
      isSyncing: s.isSyncing,
      error: s.error,
    })),
  );

export const useDataActions = (): DataActions => useDataStore((s) => s.actions);
