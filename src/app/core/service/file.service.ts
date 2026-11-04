import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FileUploadResponse } from '../interface/FileMetadata';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private readonly httpClient = inject(HttpClient);
  private readonly authFilesEndpoint= 'api/auth/files';
  private readonly filesEndpoint= 'api/files';

  // storage to share the file between HomeComponent and UploadComponent
  currentFileToUpload: File | null = null;

  /**
   * Transmits the multipart form payload safely to the Spring Boot REST backend.
   * @param formData The packaged multi-part payload containing files and metadata blob.
   * @return An observable containing the unique single-use download token.
   */
  uploadFile(authToken: string | null, formData: FormData): Observable<FileUploadResponse> {
    if ( authToken === null ) {
      console.info('No auth token found, sending file to public endpoint');
      return this.httpClient.post<FileUploadResponse>(`${this.filesEndpoint}`, formData);
    }
    console.info('Auth token found, sending file to authenticated endpoint');
    return this.httpClient.post<FileUploadResponse>(`${this.authFilesEndpoint}`, formData);
  }

    // Trigger an explicit POST streaming query receiving raw stream format arrays block context
  downloadFile(payloadRequest: any): Observable<Blob> {
    console.log('Downloading file with request:', payloadRequest);
    return this.httpClient.post(`${this.filesEndpoint}/download`, payloadRequest, { responseType: 'blob' });
  }

}
