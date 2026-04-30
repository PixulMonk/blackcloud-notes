import { SimpleResponse } from './common.types';
import { ParamsDictionary } from 'express-serve-static-core';
import { ITreeNode } from './../models/treeNode.model';

export interface TreeNodeResponse extends SimpleResponse {
  data?: ITreeNode | ITreeNode[] | null;
}

export interface TreeNodeParams extends ParamsDictionary {
  id: string;
}

export interface CreateTreeNodeResponse {
  encryptedTitle: string;
  type: string;
  isArchived: boolean;
  isDeleted: boolean;
  icon?: string;
  parentId: string;
}

export interface UpdateTreeNodeResponse {
  encryptedTitle: string;
  type: string;
  position: number;
  isArchived: boolean;
  isDeleted: boolean;
  icon?: string;
  parentId: string;
  fileId: string;
}

export interface DeleteTreeNodeResponse extends TreeNodeResponse {
  statistics?: {
    deletedNodes: number;
    deletedNotes: number;
  };
}
