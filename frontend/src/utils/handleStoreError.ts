import axios from 'axios';

const handleStoreError = (error: unknown, set: any) => {
  if (axios.isAxiosError(error)) {
    set({
      error: error.response?.data?.message || 'An error occurred',
      isLoading: false,
    });
  } else {
    set({ error: 'An unexpected error occurred', isLoading: false });
  }
};

export default handleStoreError;
