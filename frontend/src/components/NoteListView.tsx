import { FileText, RotateCcw, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type NoteStatus = "trash" | "archived";

interface NoteListViewProps {
  status: NoteStatus;
}

function NoteListView({ status }: NoteListViewProps) {
  const isTrash = status === "trash";
  const title = isTrash ? "Trash" : "Archived";
  const emptyMessage = isTrash ? "Nothing in trash." : "No archived notes.";

  // Replace with real data — e.g. useTrashedNotes() / useArchivedNotes()
  const notes: any[] = [];

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto py-8">
      <h1 className="text-lg font-semibold mb-1">{title}</h1>
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

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="size-8 text-muted-foreground mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {notes.map((note) => (
            <div
              key={note.id}
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
