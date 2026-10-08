import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { SimpleResponse } from "./common.types";
import { IUser } from "../models/user.model";

export interface ExportNoteDTO {
  _id: string;
  encryptedContent: string;
}
export interface GetNotesForExportResponse extends SimpleResponse {
  notes?: ExportNoteDTO[];
}

export interface GetNotesForExportRequest extends Request<
  ParamsDictionary,
  GetNotesForExportResponse,
  {}
> {
  user?: IUser;
}

export interface ImportTreeNode {
  _id: string; // client-generated ObjectId
  parentId: string | null;
  type: "folder" | "file";
  encryptedTitle: string;
  fileId?: string; // client-generated ObjectId, matches a note below
}

export interface ImportNote {
  _id: string; // matches fileId above
  encryptedContent: string;
}

export interface VaultImportRequest {
  importRootId: string; // the client-generated ID of the "Imported <date>" wrapper folder
  nodes: ImportTreeNode[];
  notes: ImportNote[];
}

export interface VaultImportResponse {
  success: boolean;
  imported: { nodes: number; notes: number };
  errors: { id: string; reason: string }[];
}
