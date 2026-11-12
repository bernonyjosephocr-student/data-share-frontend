import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { UploadComponent } from './upload.component';
import { FileService } from '../../core/service/file.service';
import { UserService } from '../../core/service/user.service';
import { jest } from '@jest/globals';
import { of } from 'rxjs';

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  let fileService: {
    currentFileToUpload: File | null;
    uploadFile: jest.Mock;
  };

  let userService: {
    isLoggedIn: jest.Mock;
    getToken: jest.Mock;
  };

  let router: Router;

  beforeEach(async () => {

    fileService = {// Sumilation of the home component file registration into FileService
      currentFileToUpload: new File(['content'], 'document.pdf'),
      uploadFile: jest.fn()//simulation of the FileService method uploadFile
    };

    userService = {
      isLoggedIn: jest.fn().mockReturnValue(false),
      getToken: jest.fn().mockReturnValue(null)
    };

    await TestBed.configureTestingModule({
      imports: [UploadComponent],
      providers: [
        { provide: FileService, useValue: fileService },
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with the selected file', () => {
    expect(component.selectedFiles).toEqual([
      fileService.currentFileToUpload as File
    ]);
  });

  it('should initialize a valid upload form', () => {
    expect(component.uploadForm.valid).toBe(true);
    expect(component.uploadForm.get('retentionDays')?.value).toBe(7);
  });

  it('should upload a file without authentication', () => {
    const response = { downloadToken: 'test-token' };

    fileService.uploadFile.mockReturnValue(of(response)); //retun imadiately an Observable
    userService.getToken.mockReturnValue(null);

    component.onUpload();

    expect(fileService.uploadFile).toHaveBeenCalled();
    // service uploadFile called with no token
    expect(fileService.uploadFile.mock.calls[0][0]).toBeNull();
    // and an instance of FormData
    expect(fileService.uploadFile.mock.calls[0][1]).toBeInstanceOf(FormData);
  });

  it('should display the upload success step after receiving the download token', () => {
    const response = { downloadToken: 'test-token' };

    fileService.uploadFile.mockReturnValue(of(response));

    component.onUpload();

    expect(component.generatedDownloadToken).toBe('test-token');
    expect(component.currentStep).toBe('UPLOAD_SUCCESS');
    expect(component.isUploading).toBe(false);
  });

  it('should cancel upload and return to home', () => {
    component.cancelAndReturnHome();

    expect(fileService.currentFileToUpload).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should add a valid tag', () => {
    const event = { preventDefault: jest.fn() } as unknown as Event;
    component.tagInput = ' Angular ';

    component.addTag(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.tags.has('angular')).toBe(true);
    expect(component.tagInput).toBe('');
  });

});