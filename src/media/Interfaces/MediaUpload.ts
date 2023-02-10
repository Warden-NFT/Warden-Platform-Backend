export interface MediaUploadPayload {
  metadata: StoredFileMetadata[];
  folder: string;
}

export interface FileData {
  path: string;
  contentType: string;
  media: Buffer;
  metadata: StoredFileMetadata[];
}

export interface StoredFileMetadata {
  [key: string]: string;
}

export interface MultipleMediaUploadPayload {
  folder: string;
  metadata: string;
}
export interface DeleteMedia {
  path: string;
}

export interface GetMedia {
  path: string;
}
