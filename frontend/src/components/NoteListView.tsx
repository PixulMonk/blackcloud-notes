import { useEffect } from "react";
import { FileText, RotateCcw, Trash2, X, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useData, useDataActions } from "@/store/useDataStore";
import { useDataEncryptionKey } from "@/store/useVaultStore";

type NoteStatus = "trash" | "archived";

interface NoteListViewProps {
  status: NoteStatus;
}

function NoteListView({ status }: NoteListViewProps) {
  const isTrash = status === "trash";
  const { archivedNodes, deletedNodes, isLoading } = useData();
  const dataEncryptionKey = useDataEncryptionKey();
  const { fetchNodesByStatus } = useDataActions();

  useEffect(() => {
    if (!dataEncryptionKey) return;

    void fetchNodesByStatus(status, dataEncryptionKey);
  }, [status, dataEncryptionKey, fetchNodesByStatus]);

  const notes = isTrash ? deletedNodes : archivedNodes;

  return (
    // TODO: Add a loading state when fetching notes
    // TODO: Restore and delete functionality
    // TODO: Make date formatting more readable (e.g., "2 days ago" instead of "2023-06-01T12:34:56Z")
    <div className="flex flex-col w-full max-w-3xl mx-auto py-8">
      <h1 className="text-lg font-semibold mb-1">
        {status === "trash" ? "Trash" : "Archived"}
      </h1>
      {isTrash && (
        <p className="text-xs text-muted-foreground mb-6">
          Notes are permanently deleted after 30 days.
        </p>
      )}
      {!isTrash && (
        <p className="text-xs text-muted-foreground mb-6">
          Archived notes stay out of your sidebar until restored.
        </p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader className="animate-spin" size={24} />
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-8 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">
            {status === "trash" ? "Nothing in trash." : "No archived notes."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {notes.map((note) => (
            <div
              key={note._id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-sm truncate">{note.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {isTrash
                      ? `Deleted ${note.deletedAt}`
                      : `Archived ${note.archivedAt}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="size-8">
                  <RotateCcw className="size-4" />
                </Button>
                {isTrash ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="size-8">
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NoteListView;
