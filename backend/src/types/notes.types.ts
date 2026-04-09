import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { SimpleResponse } from './common.types';
import { Note, type INote } from '../models/note.model';
import { IUser } from '../models/user.model';

export interface NoteResponse extends SimpleResponse {
  note?: INote | INote[];
}

export interface GetAllNotesRequest extends Request<
  ParamsDictionary,
  NoteResponse,
  {}
> {
  user?: IUser;
}

export interface GetNoteParams {
  id: string;
}

export interface CreateNoteRequest {
  encryptedContent: string | undefined;
}

export interface UpdateNoteRequest {
  encryptedContent: string | undefined;
}

export interface UpdateNoteParams {
  id: string;
}

export interface DeleteNoteParams {
  id: string;
}
