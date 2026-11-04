export interface FileMetadata {
    id?: number;
    name: string;
    tags: string;
    filePassword: string | null;
    expiryDate: string;
    isPasswordProtected: boolean;
    retentionDays: number;
    downloadToken: string;
    fileSize: number;
}

export interface FileUploadResponse {
    downloadToken: string;
}