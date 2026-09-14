import { useTreeUI } from "@/store/useTreeUIStore";
import EmptyPlaceholder from "@/components/Editor/EmptyPlaceholder";
import { useActiveView } from "@/store/useAppStore";
import TrashPage from "./TrashPage";
import EditorPage from "./EditorPage";
import ArchivedPage from "./ArchivedPage";
import SupportPage from "./SupportPage";

function HomePage() {
  const activeView = useActiveView();
  const { selectedFileId } = useTreeUI();

  const renderView = () => {
    // Add new views along with AppView type at app.types.ts
    switch (activeView.type) {
      case "trash":
        return <TrashPage />;
      case "archived":
        return <ArchivedPage />;
      case "editor":
        return selectedFileId ? <EditorPage /> : <EmptyPlaceholder />;
      case "empty":
        return <EmptyPlaceholder />;
      case "support":
        return <SupportPage />;
      default:
        const _exhaustive: never = activeView;
        return _exhaustive;
    }
  };

  return (
    <div className="flex flex-col w-full max-h-screen items-center p-2">
      {renderView()}
    </div>
  );
}

export default HomePage;
