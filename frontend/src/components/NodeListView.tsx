import { useEffect } from "react";
import {
  Archive,
  FileText,
  FolderClosed,
  RotateCcw,
  Trash2,
  X,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useData, useDataActions } from "@/store/useDataStore";
import { useDataEncryptionKey } from "@/store/useVaultStore";
import { formatStatusDate } from "@/lib/date";
import type { TreeNode } from "@/types/treeStore.types";
import { confirm } from "@/components/dialog/ConfirmDialog";

// TODO: pop up notif for restore and delete success/failure

type NoteStatus = "trash" | "archived";

interface NodeListViewProps {
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

function NodeListView({ status }: NodeListViewProps) {
  const isTrash = status === "trash";
  const { archivedNodes, deletedNodes, isLoading } = useData();
  const dataEncryptionKey = useDataEncryptionKey();
  const { fetchNodesByStatus, restoreNode, deleteNode, emptyTrash } =
    useDataActions();

  useEffect(() => {
    if (!dataEncryptionKey) return;

    void fetchNodesByStatus(status, dataEncryptionKey);
  }, [status, dataEncryptionKey, fetchNodesByStatus]);

  const handleRestore = async (node: TreeNode) => {
    const message = isTrash
      ? node.type === "folder"
        ? `Are you sure you want to restore the folder "${node.title}" and all its contents?`
        : `Are you sure you want to restore "${node.title}"?`
      : node.type === "folder"
        ? `Are you sure you want to restore the folder "${node.title}" and all its contents from the archive?`
        : `Are you sure you want to restore "${node.title}" from the archive?`;

    const ok = await confirm({
      title: "Restore",
      message: message,
      yesText: "Restore",
      noText: "Cancel",
    });
    if (ok) {
      await restoreNode(node._id);
    }
  };

  const handlePermanentDelete = async (node: TreeNode) => {
    const message =
      node.type === "folder"
        ? `Are you sure you want to permanently delete the folder "${node.title}" and all its contents? This action cannot be undone.`
        : `Are you sure you want to permanently delete "${node.title}"? This action cannot be undone.`;

    const ok = await confirm({
      title: "Permanently Delete",
      message: message,
      yesText: "Delete",
      noText: "Cancel",
    });
    if (ok) {
      await deleteNode(node._id);
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

  const nodes = isTrash
    ? deletedNodes.filter((node) => !hasDeletedAncestor(node, deletedNodes))
    : archivedNodes;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold mb-1">
          {status === "trash" ? "Trash" : "Archived"}
        </h1>
        {status === "trash" && nodes.length > 0 && (
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
      ) : nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {isTrash ? (
            <Trash2 className="size-8 text-muted-foreground mb-3 opacity-50" />
          ) : (
            <Archive className="size-8 text-muted-foreground mb-3 opacity-50" />
          )}

          <p className="text-sm text-muted-foreground">
            {isTrash ? "Nothing in trash." : "No archived items."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {nodes.map((node) => (
            <div
              key={node._id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {node.type === "folder" ? (
                  <FolderClosed className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate">{node.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {isTrash
                      ? formatStatusDate(node.deletedAt, "Deleted")
                      : formatStatusDate(node.archivedAt, "Archived")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleRestore(node)}
                >
                  <RotateCcw className="size-4" />
                </Button>
                {isTrash ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => handlePermanentDelete(node)}
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

export default NodeListView;
