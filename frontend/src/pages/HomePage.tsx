import { useTreeUI } from '@/store/useTreeUIStore';
import EmptyPlaceholder from '@/components/Editor/EmptyPlaceholder';
import { useActiveView } from '@/store/useAppStore';
import TrashPage from './TrashPage';
import SettingsPage from './SettingsPage';
import EditorPage from './EditorPage';
import ArchivedPage from './ArchivedPage';

function HomePage() {
  const activeView = useActiveView();
  const { selectedFileId } = useTreeUI();

  const renderView = () => {
    // Add new views along with AppView type at app.types.ts
    switch (activeView?.type) {
      case 'trash':
        return <TrashPage />;
      case 'archived':
        return <ArchivedPage />;
      case 'settings':
        return <SettingsPage />;
      case 'editor':
        return selectedFileId ? <EditorPage /> : <EmptyPlaceholder />;
      default:
        return <EmptyPlaceholder />;
    }
  };

  return (
    <div className="flex flex-col w-full max-h-screen items-center p-2">
      {renderView()}
    </div>
  );
}

export default HomePage;
