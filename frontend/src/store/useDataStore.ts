import { create } from 'zustand';
import axios from 'axios';
import { type TreeNode, type AddNodeResponse } from '../types/tree';

const BASE_URL = 'http://localhost:3000/api';
axios.defaults.withCredentials = true;

// TODO: error toast?

interface DataState {
  tree: TreeNode[];
  isLoading: boolean;
  error: string | null;
  fetchTree: () => Promise<void>;
  addNode: (
    type: 'folder' | 'file',
    title?: string | null,
    isArchived?: boolean,
    isDeleted?: boolean,
    icon?: string | null,
    parentId?: string | null
  ) => Promise<TreeNode | null>;
  updateNode: (
    id: string,
    title?: string | null,
    type?: 'folder' | 'file',
    isArchived?: boolean,
    isDeleted?: boolean,
    icon?: string | null,
    parentId?: string | null,
    fileId?: string
  ) => Promise<TreeNode | null>;
  softDeleteNode: (id: string) => Promise<TreeNode | null>;
  archiveNode: (id: string) => Promise<TreeNode | null>;
}

export const useDataStore = create<DataState>((set) => ({
  tree: [],
  isLoading: false,
  error: null,

  fetchTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<{ success: boolean; tree: TreeNode[] }>(
        `${BASE_URL}/tree/build`
      );
      set({ tree: response.data.tree, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tree', isLoading: false });
    }
  },

  addNode: async (
    type,
    title = null,
    isArchived = false,
    isDeleted = false,
    icon = null,
    parentId = null
  ) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<AddNodeResponse>(
        `${BASE_URL}/treeNodes/create`,
        {
          title,
          type,
          isArchived,
          isDeleted,
          icon,
          parentId,
        }
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
    id,
    title,
    type,
    isArchived,
    isDeleted,
    icon,
    parentId,
    fileId
  ) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch<AddNodeResponse>(
        `${BASE_URL}/treeNodes/${id}`,
        {
          title,
          type,
          isArchived,
          isDeleted,
          icon,
          parentId,
          fileId,
        }
      );

      const updatedNode = response.data.data;

      set((state) => ({
        tree: state.tree.map((n) =>
          n._id === id ? { ...n, ...updatedNode } : n
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

  softDeleteNode: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch<AddNodeResponse>(
        `${BASE_URL}/treeNodes/${id}/soft-delete`
      );

      const updatedNode = response.data.data;

      set((state) => ({
        tree: state.tree.map((n) =>
          n._id === id ? { ...n, ...updatedNode } : n
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

  archiveNode: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const response = await axios.patch<AddNodeResponse>(
        `${BASE_URL}/treeNodes/${id}/archive`
      );

      const updatedNode = response.data.data;

      set((state) => ({
        tree: state.tree.map((n) =>
          n._id === id ? { ...n, ...updatedNode } : n
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
}));
