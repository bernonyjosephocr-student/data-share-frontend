import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';
import { FileService } from '../../core/service/file.service';
import { jest } from '@jest/globals';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let fileService: Pick<FileService, 'currentFileToUpload'>;
  let router: { navigate: jest.Mock };

  beforeEach(async () => {
    fileService = {
      currentFileToUpload: null
    };

    router = {
      navigate: jest.fn<() => Promise<boolean>>().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: FileService, useValue: fileService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should select a valid file and navigate to upload', () => {
    const file = new File(['file content'], 'document.pdf', {
      type: 'application/pdf'
    });

    const event = {
      target: {
        files: [file]
      }
    };

    component.onFileSelected(event);

    expect(fileService.currentFileToUpload).toBe(file);
    expect(router.navigate).toHaveBeenCalledWith(['/upload']);
  });

  it('should reject a file that exceeds the maximum size', () => {
    const file = new File(['content'], 'document.pdf');

    Object.defineProperty(file, 'size', {
      value: 1024 * 1024 * 1024 + 1
    });

    const event = {
      target: {
        files: [file]
      }
    };

    component.onFileSelected(event);

    expect(component.errorMessage).toBeTruthy();
    expect(fileService.currentFileToUpload).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should reject an empty file', () => {
    const file = new File([], 'document.pdf');

    const event = {
      target: {
        files: [file]
      }
    };

    component.onFileSelected(event);

    expect(component.errorMessage).toBeTruthy();
    expect(fileService.currentFileToUpload).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should reject a file with a forbidden extension', () => {
    const file = new File(['content'], 'malware.exe');

    const event = {
      target: {
        files: [file]
      }
    };

    component.onFileSelected(event);

    expect(component.errorMessage).toBeTruthy();
    expect(fileService.currentFileToUpload).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

});