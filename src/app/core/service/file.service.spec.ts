import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FileService } from './file.service';

describe('FileService', () => {
  let service: FileService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]  //for intercepting the queries to the backend
    });
    service = TestBed.inject(FileService);
    httpTestingController = TestBed.inject(HttpTestingController)
  });

  afterEach(() => {
    httpTestingController.verify(); //checks no request is pending
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload a file without authentication', () => {
    const formData = new FormData();
    const response = { downloadToken: 'test-token' };

    service.uploadFile(null, formData).subscribe(result => {
      expect(result).toEqual(response);
    });

    const request = httpTestingController.expectOne('api/files'); // user not conected, this path must be called

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(formData);

    request.flush(response);
  });

  it('should upload a file with authentication', () => {
    const formData = new FormData();
    const response = { downloadToken: 'test-token' };

    service.uploadFile('jwt-token', formData).subscribe(result => {
      expect(result).toEqual(response);
    });

    const request = httpTestingController.expectOne('api/auth/files');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBe(formData);

    request.flush(response);
  });

  it('should download a file', () => {
    const payloadRequest = { downloadToken: 'test-token' };
    const blob = new Blob(['file content'], { type: 'text/plain' });

    service.downloadFile(payloadRequest).subscribe(result => {
      expect(result).toEqual(blob);
    });

    const request = httpTestingController.expectOne('api/files/download');

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payloadRequest);
    expect(request.request.responseType).toBe('blob');

    request.flush(blob);
  });
});
