import Editor from '@/components/Editor/Editor';

import { DocumentTitle } from '@/components/Editor/DocumentTitle';
import SyncingIndicator from '@/components/Editor/SyncingIndicator';
<<<<<<< HEAD
import { useTreeUIStore } from '@/store/useTreeUIStore';

function HomePage() {
  const selectedNodeId = useTreeUIStore((state) => state.selectedNodeId);
=======
import { useTreeUI } from '@/store/useTreeUIStore';

function HomePage() {
  const { selectedNodeId } = useTreeUI();
>>>>>>> development

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
