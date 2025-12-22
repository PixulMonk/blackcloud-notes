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
  archiveNodeRecursively: (
    rootId: string,
    opts?: { isArchived?: boolean; isDeleted?: boolean }
  ) => Promise<void>;
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

      // Update state immutably
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

  // helper - returns ids (including root)
  getDescendantIds: (tree: TreeNode[], rootId: string) => {
    const byParent = new Map<string, string[]>();
    for (const n of tree) {
      if (n.parentId)
        byParent.set(n.parentId, [...(byParent.get(n.parentId) || []), n._id]);
    }
    const out: string[] = [];
    const stack = [rootId];
    while (stack.length) {
      const id = stack.pop()!;
      out.push(id);
      const kids = byParent.get(id);
      if (kids) stack.push(...kids);
    }
    return out;
  },

  archiveNodeRecursively: async (
    rootId: string,
    opts = { isArchived: true, isDeleted: true }
  ) => {
    set({ isLoading: true, error: null });
    try {
      const ids = getDescendantIds(useDataStore.getState().tree, rootId);

      // Prefer: single backend bulk endpoint (e.g. POST /treeNodes/bulkPatch)
      // Fallback: parallel PATCH for each id
      await Promise.all(
        ids.map((id) =>
          axios.patch(`${BASE_URL}/treeNodes/${id}`, {
            isArchived: opts.isArchived,
            isDeleted: opts.isDeleted,
          })
        )
      );

      // Apply to local state
      set((state) => ({
        tree: state.tree.map((n) =>
          ids.includes(n._id)
            ? { ...n, isArchived: opts.isArchived, isDeleted: opts.isDeleted }
            : n
        ),
        isLoading: false,
      }));

      // Optionally refresh from server if you want canonical data
      await useDataStore.getState().fetchTree();
    } catch (err: any) {
      set({
        error: err.message || 'Failed to archive nodes',
        isLoading: false,
      });
    }
  },
}));
