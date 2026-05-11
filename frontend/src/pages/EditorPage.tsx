import 'highlight.js/styles/github-dark.css';

import Editor from '@/components/Editor/Editor';
import SyncingIndicator from '@/components/Editor/SyncingIndicator';

function EditorPage() {
  return (
    <div className="w-full max-w-5xl">
      <SyncingIndicator />
      <Editor />
    </div>
  );
}

export default EditorPage;
