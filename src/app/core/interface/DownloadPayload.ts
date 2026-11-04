export interface DownloadPayload {
  fileName: string;
  fileSize: number;
  isPassReq: boolean;
  exp: number; // Expiration timestamp in seconds
}