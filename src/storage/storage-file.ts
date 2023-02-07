export class StorageFile {
  buffer: Buffer;
  metadata: Map<string, string>;
  contentType: string;
}

export class StorageFileWithMetadata {
  file: StorageFile;
  ticketMetadata: string;
}
