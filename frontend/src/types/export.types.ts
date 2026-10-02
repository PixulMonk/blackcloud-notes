export interface ExportNoteDTO {
  _id: string;
  encryptedContent: string;
}

export interface ExportTreeNode {
  _id: string;
  title: string;
  type: "folder" | "file";
  fileId?: string | null;
  children?: ExportTreeNode[];
}

export interface StartExportMessage {
  type: "start";
  dek: Uint8Array;
  tree: ExportTreeNode[]; // main tree, from buildTree
  archivedNodes: ExportTreeNode[]; // flat list, per the above
  notes: ExportNoteDTO[]; // bulk payload from getNotesForExport
}

export interface ProgressMessage {
  type: "progress";
  completed: number;
  total: number;
}

export interface DoneMessage {
  type: "done";
  blob: Blob;
  errors: { noteId: string; title: string; reason: string }[];
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type WorkerOutMessage = ProgressMessage | DoneMessage | ErrorMessage;
