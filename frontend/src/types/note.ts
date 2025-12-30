export interface NoteDTO {
  _id: string;
  userId: string;
  title?: string;
  encryptedContent?: string;
  tags?: string[];
}

// TO be used later when decrypting content
export interface NoteContentDTO {
  _id: string;
  title?: string;
  content: string;
  tags?: string[];
}

export interface GetNoteResponse {
  success: boolean;
  message: string;
  data: NoteDTO;
}
