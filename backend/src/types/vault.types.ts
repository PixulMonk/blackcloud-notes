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
