import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FileMetadata } from '../../core/interface/FileMetadata';
import { FileService } from '../../core/service/file.service';

// Filter type for the file list view
export type FileFilter = 'ALL' | 'ACTIVE' | 'EXPIRED';

@Component({
  selector: 'app-my-space',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-space.component.html',
  styleUrls: ['./my-space.component.scss']
})
export class MySpaceComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fileService = inject(FileService);  

  // Core data arrays
  allFiles: FileMetadata[] = [];
  filteredFiles: FileMetadata[] = [];
  
  // Active filter state binding
  activeFilter: FileFilter = 'ACTIVE';
  
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.fetchUserFiles();
  }

  /**
   * Fetches the shared files catalog belonging to the logged-in user session.
   */
  fetchUserFiles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.fileService.fetchFilesForUser().subscribe({
        next: (data: FileMetadata[]) => {
          this.allFiles = data;
          console.info('Fetched user files catalog:', this.allFiles);
          this.applyFilter(this.activeFilter); // Refresh list display logic
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load files catalog. Please try again later.';
          this.isLoading = false;
          console.error('API catalog fetch failure:', error);
        }
      });
  }

  /**
   * Evaluates if a file timestamp is historically behind the current system day boundary.
   */
  isFileExpired(expiryDateStr: string): boolean {
    const expiryDate = new Date(expiryDateStr);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Normalized to midnight for safe daily calculations
    return expiryDate.getTime() < currentDate.getTime();
  }

  /**
   * Directs the router view towards the unique dynamic download share URL.
   */
  navigateToFile(downloadToken: string): void {
    void this.router.navigate([`/${downloadToken}`]);
  }

  /**
   * Filters the file list array matching the chosen tab category option state.
   */
  applyFilter(filter: FileFilter): void {
    this.activeFilter = filter;

    if (filter === 'ALL') {
      this.filteredFiles = [...this.allFiles];
    } else if (filter === 'ACTIVE') {
      this.filteredFiles = this.allFiles.filter(file => !this.isFileExpired(file.expiryDate));
    } else if (filter === 'EXPIRED') {
      this.filteredFiles = this.allFiles.filter(file => this.isFileExpired(file.expiryDate));
    }
  }

    /**
   * Dispatches a DELETE request to clear out the target directory record.
   */
  deleteFile(fileId: number | null | undefined, event: Event): void {
    event.stopPropagation(); // Avoids firing parent row item click navigations
    
    // 1. Stop if the ID is missing
    if (fileId === null || fileId === undefined) {
      console.error('File ID is missing. Cannot proceed with deletion.');
      return;
    }
    
    // 2. proceed the deletion if action is confirmed by the user
    if (confirm('Este-vous sûr de vouloir supprimer définitivement ce package de fichiers partagés?')) {
      this.fileService.deleteFile(fileId).subscribe({
        next: () => {
          this.allFiles = this.allFiles.filter(f => f.id !== fileId);
          this.applyFilter(this.activeFilter);
        },
        error: (err) => console.error('Deletion failure:', err)
      });
    }
  }

}
