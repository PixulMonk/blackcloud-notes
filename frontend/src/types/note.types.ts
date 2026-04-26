export interface NoteDTO {
  _id: string;
  userId: string;
  title?: string;
  encryptedContent?: string;
  tags?: string[];
}

export interface NoteContentDTO {
  _id: string;
  title?: string;
  content: string;
  tags?: string[];
}

export interface NoteResponse {
  success: boolean;
  message: string;
  note: NoteDTO;
}
