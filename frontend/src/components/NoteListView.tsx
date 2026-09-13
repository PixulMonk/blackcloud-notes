import { useEffect, useState } from "react";
import { FileText, RotateCcw, Trash2, X, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useData, useDataActions } from "@/store/useDataStore";
import { useDataEncryptionKey } from "@/store/useVaultStore";
import { formatStatusDate } from "@/lib/date";
import type { TreeNode } from "@/types/treeStore.types";
import { confirm } from "@/components/dialog/ConfirmDialog";

// TODO: pop up notif for restore and delete success/failure

type NoteStatus = "trash" | "archived";

interface NoteListViewProps {
  status: NoteStatus;
}

const hasDeletedAncestor = (node: TreeNode, deletedNodes: TreeNode[]) => {
  const deletedNodeById = new Map(
    deletedNodes.map((deletedNode) => [deletedNode._id, deletedNode]),
  );
  const visitedIds = new Set<string>();
  let parentId = node.parentId;

  while (parentId && !visitedIds.has(parentId)) {
    if (deletedNodeById.has(parentId)) return true;

    visitedIds.add(parentId);
    parentId = deletedNodeById.get(parentId)?.parentId ?? null;
  }

  return false;
};

function NoteListView({ status }: NoteListViewProps) {
  const isTrash = status === "trash";
  const { archivedNodes, deletedNodes, isLoading } = useData();
  const dataEncryptionKey = useDataEncryptionKey();
  const { fetchNodesByStatus, restoreNode, deleteNode, emptyTrash } =
    useDataActions();

  useEffect(() => {
    if (!dataEncryptionKey) return;

    void fetchNodesByStatus(status, dataEncryptionKey);
  }, [status, dataEncryptionKey, fetchNodesByStatus]);

  const handleRestore = async (nodeId: string, nodeTitle: string) => {
    const ok = await confirm({
      title: "Restore",
      message: `Are you sure you want to restore "${nodeTitle}"?`,
      yesText: "Restore",
      noText: "Cancel",
    });
    if (ok) {
      await restoreNode(nodeId);
    }
  };

  const handlePermanentDelete = async (nodeId: string, nodeTitle: string) => {
    const ok = await confirm({
      title: "Permanently Delete",
      message: `Are you sure you want to permanently delete "${nodeTitle}"? This action cannot be undone.`,
      yesText: "Delete",
      noText: "Cancel",
    });
    if (ok) {
      await deleteNode(nodeId);
    }
  };

  const handleEmptyTrash = async () => {
    const ok = await confirm({
      title: "Empty Trash",
      message:
        "Are you sure you want to permanently delete all items in the trash? This action cannot be undone.",
      yesText: "Empty Trash",
      noText: "Cancel",
    });
    if (ok) {
      await emptyTrash();
    }
  };

  const notes = isTrash
    ? deletedNodes.filter((node) => !hasDeletedAncestor(node, deletedNodes))
    : archivedNodes;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold mb-1">
          {status === "trash" ? "Trash" : "Archived"}
        </h1>
        {status === "trash" && notes.length > 0 && (
          <Button size="sm" variant="destructive" onClick={handleEmptyTrash}>
            Empty Trash
          </Button>
        )}
      </div>

      {/* {isTrash && (
        <p className="text-xs text-muted-foreground mb-6">
          Notes are permanently deleted after 30 days.
        </p>
      )} */}
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
                      ? formatStatusDate(note.deletedAt, "Deleted")
                      : formatStatusDate(note.archivedAt, "Archived")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleRestore(note._id, note.title)}
                >
                  <RotateCcw className="size-4" />
                </Button>
                {isTrash ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => handlePermanentDelete(note._id, note.title)}
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
