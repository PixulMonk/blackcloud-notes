import { SimpleResponse } from "./common.types";

export interface SupportRequest {
  subject: string;
  message: string;
}

export interface SubmitSupportRequest {
  email: string;
  subject: string;
  message: string;
}

export interface SubmitSupportResponse extends SimpleResponse {
  retryAfter?: number;
}
