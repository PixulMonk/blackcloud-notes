import { create } from 'zustand';
import axios from 'axios';
import { type TreeNode } from '../types/tree';

const API_URL = 'http://localhost:3000/api/tree';
axios.defaults.withCredentials = true;

interface DataState {
  tree: TreeNode[];
  loading: boolean;
  error: string | null;
  fetchTree: () => Promise<void>;
}

export const useDataStore = create<DataState>((set) => ({
  tree: [],
  loading: false,
  error: null,

  //   TODO: refactor and double check

  fetchTree: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get<{ success: boolean; tree: TreeNode[] }>(
        `${API_URL}/build`
      );
      set({ tree: res.data.tree, loading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tree', loading: false });
    }
  },
}));
