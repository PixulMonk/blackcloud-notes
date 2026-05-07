import { useNavigate } from 'react-router-dom';
import { useDataActions } from '@/store/useDataStore';
import { useTreeUIActions } from '@/store/useTreeUIStore';
import { useDataEncryptionKey } from '@/store/useVaultStore';
import { getGreeting } from '@/lib/utils';

export default function EmptyPlaceholder() {
  const navigate = useNavigate();
  const { addNode } = useDataActions();
  const { setRenamingNodeId } = useTreeUIActions();
  const dataEncryptionKey = useDataEncryptionKey();

  const handleCreateNote = async () => {
    if (!dataEncryptionKey) {
      navigate('/unlock-vault', { state: { from: location.pathname } });
      return;
    }
    const newNode = await addNode('file', dataEncryptionKey);
    if (newNode?._id) {
      setRenamingNodeId(newNode._id);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-0 py-20 px-4 select-none">
      {/* Logo mark */}
      <div className="mb-8 animate-fade-up">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect
              x="7"
              y="15"
              width="18"
              height="13"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <path
              d="M11 15v-4a5 5 0 0 1 10 0v4"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <circle cx="16" cy="21" r="1.75" fill="currentColor" />
            <line
              x1="16"
              y1="22.75"
              x2="16"
              y2="25"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
        {getGreeting()}
      </p>

      <h1 className="text-2xl font-medium text-center leading-snug mb-2">
        Your thoughts, fully encrypted.
      </h1>

      <p className="text-sm text-muted-foreground text-center leading-relaxed mb-8">
        Only you can read what you write.
        <br />
        Create a note to get started.
      </p>

      <button
        onClick={handleCreateNote}
        className="inline-flex items-center gap-2 bg-foreground text-background rounded-lg px-5 py-2.5 text-sm font-medium hover:opacity-85 active:scale-95 transition-all"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path
            d="M6.5 1v11M1 6.5h11"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
        Create note
      </button>

      <p className="mt-5 text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-pulse" />
        End-to-end encrypted
      </p>
    </div>
  );
}
