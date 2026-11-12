import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

import { FileDownloadComponent } from './file-download.component';
import { FileService } from '../../core/service/file.service';
import { jest } from '@jest/globals';

describe('FileDownloadComponent', () => {
  let component: FileDownloadComponent;
  let fixture: ComponentFixture<FileDownloadComponent>;

  let fileService: {
    downloadFile: jest.Mock;
  };

  let token: string;

  beforeEach(async () => {
    const payload = {
      fileName: 'document.pdf',
      fileSize: 1024,
      isPassReq: false,
      exp: Math.floor(Date.now() / 1000) + 86400
    };

    token = `header.${btoa(JSON.stringify(payload))}.signature`;

    fileService = {
      downloadFile: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [FileDownloadComponent],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => token
              }
            }
          }
        },
        {
          provide: Router,
          useValue: { navigate: jest.fn() }
        },
        {
          provide: FileService,
          useValue: fileService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FileDownloadComponent);
    component = fixture.componentInstance;
    
  });

  it('should initialize with a valid token', () => {
    fixture.detectChanges();

    expect(component.token).toBe(token);
    expect(component.fileName).toBe('document.pdf');
    expect(component.fileSize).toBe(1024);
    expect(component.isExpired).toBe(false);
    expect(component.remainingDays).toBe(1);
    expect(component.downloadForm.valid).toBe(true);
  });

  it('should detect an expired token', () => {
    const payload = {
      fileName: 'document.pdf',
      fileSize: 1024,
      isPassReq: false,
      exp: Math.floor(Date.now() / 1000) - 86400
    };

    token = `header.${btoa(JSON.stringify(payload))}.signature`;

    fixture.detectChanges(); //triggers NavigationDestination();

    expect(component.isExpired).toBe(true);
    expect(component.downloadForm).toBeUndefined();
  });

  it('should download a file without password', () => {
    fileService.downloadFile.mockReturnValue(of(new Blob(['content'])));

    fixture.detectChanges();

    component.onExecuteDownload();

    expect(fileService.downloadFile).toHaveBeenCalled();

    const payloadRequest = fileService.downloadFile.mock.calls[0][0];

    expect(payloadRequest).toEqual({
      token,
      filePassword: null
    });
  });

  it('should download a password-protected file', () => {
    const payload = {
      fileName: 'document.pdf',
      fileSize: 1024,
      isPassReq: true,
      exp: Math.floor(Date.now() / 1000) + 86400
    };

    token = `header.${btoa(JSON.stringify(payload))}.signature`;

    fileService.downloadFile.mockReturnValue(of(new Blob(['content'])));

    fixture.detectChanges();

    component.downloadForm.get('password')?.setValue('secret123');

    component.onExecuteDownload();

    expect(fileService.downloadFile).toHaveBeenCalled();

    const payloadRequest = fileService.downloadFile.mock.calls[0][0];

    expect(payloadRequest).toEqual({
      token,
      filePassword: 'secret123'
    });
  });

  it('should trigger the file download after receiving the Blob', () => {
    const blob = new Blob(['file content'], { type: 'application/pdf' });

    window.URL.createObjectURL = jest.fn().mockReturnValue('blob:test-url');
    window.URL.revokeObjectURL = jest.fn();

    const clickSpy = jest.spyOn(
      HTMLAnchorElement.prototype,
      'click'
    ).mockImplementation(() => {});

    fileService.downloadFile.mockReturnValue(of(blob));

    fixture.detectChanges();

    component.onExecuteDownload();

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    expect(component.isDownloading).toBe(false);

    clickSpy.mockRestore();
  });
});