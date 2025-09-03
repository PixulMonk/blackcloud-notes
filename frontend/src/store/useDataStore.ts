import { create } from 'zustand';
import axios from 'axios';
import { type TreeNode } from '../types/tree';

const API_URL = 'http://localhost:3000/api/tree';
axios.defaults.withCredentials = true;

interface DataState {
  tree: TreeNode[];
  isLoading: boolean;
  error: string | null;
  fetchTree: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  tree: [],
  isLoading: false,
  error: null,

  fetchTree: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get<{ success: boolean; tree: TreeNode[] }>(
        `${API_URL}/build`
      );
      set({ tree: response.data.tree, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tree', isLoading: false });
    }
  },
}));
