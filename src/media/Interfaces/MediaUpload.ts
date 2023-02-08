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
export interface DeleteMediaDTO {
  path: string;
}

export interface GetMediaDTO {
  path: string;
}
