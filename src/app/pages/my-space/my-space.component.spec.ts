import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { jest } from '@jest/globals';

import { MySpaceComponent } from './my-space.component';
import { FileService } from '../../core/service/file.service';
import { FileMetadata } from '../../core/interface/FileMetadata';

describe('MySpaceComponent', () => {
  let component: MySpaceComponent;
  let fixture: ComponentFixture<MySpaceComponent>;

  const fileService = {
    fetchFilesForUser: jest.fn().mockReturnValue(of([])),
    deleteFile: jest.fn().mockReturnValue(of(undefined))
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [MySpaceComponent],
      providers: [
        provideRouter([]),
        { provide: FileService, useValue: fileService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MySpaceComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should fetch and display user files', () => {
    const file = {
      id: 1,
      expiryDate: new Date(Date.now() + 86400000).toISOString()
    } as FileMetadata;

    fileService.fetchFilesForUser.mockReturnValue(of([file]));

    fixture.detectChanges();

    expect(fileService.fetchFilesForUser).toHaveBeenCalled();
    expect(component.allFiles).toEqual([file]);
    expect(component.filteredFiles).toEqual([file]);
    expect(component.isLoading).toBe(false);
  });

  it('should delete a file after confirmation', () => {
    const file = {
      id: 1,
      expiryDate: new Date(Date.now() + 86400000).toISOString()
    } as FileMetadata;

    const event = {
      stopPropagation: jest.fn()
    } as unknown as Event;

    component.allFiles = [file];
    component.activeFilter = 'ALL';

    jest.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteFile(file.id, event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(fileService.deleteFile).toHaveBeenCalledWith(file.id);
    expect(component.allFiles).toEqual([]);
    expect(component.filteredFiles).toEqual([]);
  });
});