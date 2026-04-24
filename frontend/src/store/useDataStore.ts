import { create } from 'zustand';
import axios from 'axios';
import type {
  DataActions,
  DataState,
  DataStoreState,
  TreeNodeResponse,
  TreeResponse,
} from '@/types/data.types';
import { encryptAESGCM } from '@/lib/crypto/aes';
import { useShallow } from 'zustand/react/shallow';
import type { NoteResponse } from '@/types/note.types';

const BASE_URL = 'http://localhost:3000/api';
axios.defaults.withCredentials = true;

// TODO: error toast?

// TODO: There seems to be some separation of concerns issue in these zustand actions
// The zustand actions role should merely be to make a call to the backend to update the DB
// Encryption and decryption happens outside of this actions to avoid debug nightmare
const useDataStore = create<DataState>((set) => ({
  tree: [],
  isLoading: false,
  isFetchingContent: false,
  isSyncing: false,
  error: null,
  actions: {
    fetchTree: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.get<TreeResponse>(
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
        const response = await axios.post<TreeNodeResponse>(
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
        // 1. Encrypt title
        const titlePlainText = new TextEncoder().encode(title);
        const encryptedTitle = await encryptAESGCM(
          titlePlainText,
          dataEncryptionKey,
        );

        const response = await axios.patch<TreeNodeResponse>(
          `${BASE_URL}/treeNodes/${nodeId}`,
          {
            encryptedTitle,
            type,
            position,
            isArchived,
            isDeleted,
            icon,
            parentId,
            fileId,
          },
        );

        const updatedNode = response.data.data;

        if (!updatedNode) {
          throw new Error('Invalid server response when updating node');
        }

        set((state) => ({
          tree: state.tree.map((n) =>
            n._id === nodeId ? { ...n, ...updatedNode } : n,
          ),
          isLoading: false,
        }));
        // TODO: This line below is questionable. Come back to it later
        await useDataStore.getState().actions.fetchTree();
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
        const response = await axios.patch<TreeNodeResponse>(
          `${BASE_URL}/treeNodes/${nodeId}/soft-delete`,
        );

        const updatedNode = response.data.data;

        set((state) => ({
          tree: state.tree.map((n) =>
            n._id === nodeId ? { ...n, ...updatedNode } : n,
          ),
          isLoading: false,
        }));
        // TODO: again, this way of updating the backend needs to be reconsidered
        await useDataStore.getState().actions.fetchTree();
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
        const response = await axios.patch<TreeNodeResponse>(
          `${BASE_URL}/treeNodes/${nodeId}/archive`,
        );

        const updatedNode = response.data.data;

        set((state) => ({
          tree: state.tree.map((n) =>
            n._id === nodeId ? { ...n, ...updatedNode } : n,
          ),
          isLoading: false,
        }));
        // TODO: check
        await useDataStore.getState().actions.fetchTree();
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
        const response = await axios.patch<NoteResponse>(
          `${BASE_URL}/notes/${fileId}`,
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
      isSyncing: s.isFetchingContent,
      error: s.error,
    })),
  );

export const useDataActions = (): DataActions => useDataStore((s) => s.actions);
