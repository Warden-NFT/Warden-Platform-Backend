export interface MediaUploadPayload {
  mediaId: string;
  folder: string;
}

export interface MultipleMediaUploadPayload {
  folder: string;
}
export interface SaveTicketSetDTO {
  folder: string;
  ticketMetadata: string;
}

export interface DeleteMediaDTO {
  path: string;
}

export interface GetMediaDTO {
  path: string;
}
