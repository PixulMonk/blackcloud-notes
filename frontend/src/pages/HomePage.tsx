import Editor from '@/components/Editor/Editor';

import { DocumentTitle } from '@/components/Editor/DocumentTitle';
import SyncingIndicator from '@/components/Editor/SyncingIndicator';
import { useTreeUI } from '@/store/useTreeUIStore';
import EmptyPlaceholder from '@/components/Editor/EmptyPlaceholder';

function HomePage() {
  const { selectedNodeId } = useTreeUI();

  return (
    <div className="flex flex-col w-full max-h-screen items-center p-2">
      {selectedNodeId ? (
        <div className="w-full max-w-5xl">
          <SyncingIndicator />
          <Editor />
        </div>
      ) : (
        <EmptyPlaceholder />
      )}
    </div>
  );
}

export default HomePage;
