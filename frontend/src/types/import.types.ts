export interface ImportTreeNode {
  _id: string;
  parentId: string | null;
  type: "folder" | "file";
  encryptedTitle: string;
  fileId?: string;
}

export interface ImportNote {
  _id: string;
  encryptedContent: string;
}

export interface VaultImportRequest {
  importRootId: string;
  nodes: ImportTreeNode[];
  notes: ImportNote[];
}

export interface VaultImportResponse {
  success: boolean;
  imported: { nodes: number; notes: number };
  errors: { id: string; reason: string }[];
}
