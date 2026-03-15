import Editor from '@/components/Editor';

import { DocumentTitle } from '@/components/DocumentTitle';
import SyncingIndicator from '../components/SavingIndicator';

import { useTreeUIStore } from '@/store/useTreeUIStore';

function HomePage() {
  const selectedNodeId = useTreeUIStore((state) => state.selectedNodeId);

  return (
    <div className="flex flex-col w-full max-h-screen items-center p-2">
      {selectedNodeId ? (
        <div className="w-full max-w-5xl">
          <DocumentTitle />
          <SyncingIndicator />
          <Editor />
        </div>
      ) : (
        // TODO: This is a placeholder h1. Change to something more decorative or functional later on
        <h1>Create or open a document to get started</h1>
      )}
    </div>
  );
}

export default HomePage;
