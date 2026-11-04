import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileService } from '../../core/service/file.service';
import { Router } from '@angular/router';
import { FileMetadata } from '../../core/interface/FileMetadata';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule
  ],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  private readonly fileBuilder = inject(FormBuilder);
  private readonly fileService = inject(FileService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

    // Starts directly on step 2 since step 1 is processed inside HomeComponent
  currentStep: 'FILL_METADATA' | 'UPLOAD_SUCCESS' = 'FILL_METADATA';
  // Initialized in ngOnInit
  uploadForm: FormGroup = new FormGroup({}); 

  //Here, a list is set but limited to only one file. A configuration point wille be set for the number of files supported
  selectedFiles: File[] = [];
  tagInput: string = '';
  tags: Set<string> = new Set<string>();
  isTagsVisible: boolean = false; // Controls the visibility of the tag input field and tag list

  // Holds the finalized single-use download token returned by Spring Boot
  generatedDownloadToken: string = '';

  isUploading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
      // Get the file selected in HomeComponent and validate it here in UploadComponent
    const fileFromHome = this.fileService.currentFileToUpload;

    if (!fileFromHome) {
      return;
    }

    this.selectedFiles = [fileFromHome];
    this.isTagsVisible = this.userService.isLoggedIn(); // Show tag input only for logged-in users 
    this.initForm();
  }

  private initForm(): void {
    this.uploadForm = this.fileBuilder.group({
      filePassword: ['', [Validators.minLength(6)]],
      retentionDays: [7, [Validators.required, Validators.min(1), Validators.max(7)]],
      tagInput: ['', [Validators.minLength(2), Validators.maxLength(30)]] // This field is used for adding tags, but not part of the final metadata
    });
  }

  cancelAndReturnHome(): void {
    this.fileService.currentFileToUpload = null;
    // Navigate back to home page
    this.router.navigate(['/']);
  }

  addTag(event: Event): void {
    event.preventDefault();
    const cleanTag = this.tagInput.trim().toLowerCase();
    if (cleanTag && cleanTag.length >= 2 && cleanTag.length <= 30 && !this.tags.has(cleanTag)) {
      this.tags.add(cleanTag);
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  onUpload(): void {
    console.log('Fichier :', this.selectedFiles[0].name);
    console.log('Taille en octets :', this.selectedFiles[0].size);
    console.log('Taille en Mo :', this.selectedFiles[0].size / 1024 / 1024);
    console.log('Upload button clicked. Preparing to upload...');
    if (this.uploadForm.invalid || this.selectedFiles.length === 0 || this.isUploading) {
      this.errorMessage = 'Please ensure all required fields are filled and a file is selected.';
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';

    const formData = new FormData();
    this.selectedFiles.forEach((file) => {
      formData.append('file', file, file.name);
    });
    
    const fileMetadata: FileMetadata = this.uploadForm.getRawValue() as FileMetadata;
    fileMetadata.tags = Array.from(this.tags).join('-');
    console.info('File metadata prepared for upload:', fileMetadata); 
/*     //const formValues = this.uploadForm.value;
    const metadataDto = {
      password: formValues.password || null,
      retentionDays: formValues.retentionDays,
      //tags: Array.from(this.tags)
    }; */

    const metadataBlob = new Blob([JSON.stringify(fileMetadata)], {
      type: 'application/json'
    });
    formData.append('metadata', metadataBlob);

    this.fileService.uploadFile(this.userService.getToken(), formData).subscribe({
      next: (fileUploadResponse) => {
        this.isUploading = false;
        console.log('File uploaded successfully. Received download token:', fileUploadResponse.downloadToken);
        this.generatedDownloadToken = fileUploadResponse.downloadToken;
        console.log('File uploaded successfully. Received download token:', this.generatedDownloadToken);
        // Switch view state straight to success layout panels
        this.currentStep = 'UPLOAD_SUCCESS';
      },
      error: (error) => {
        this.isUploading = false;
        this.errorMessage = 'Network transmission failed. Please try again later.';
        console.error(error);
      }
    });
  }

  /**
   * Copies the generated download token share link directly to the user clipboard.
   */
  copyLinkToClipboard(): void {
    const fullUrl = `http://localhost:4200/${this.generatedDownloadToken}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      console.log('Share link copied to clipboard successfully!');
      // Optional: you can set a transient boolean flag like "isCopied = true" to show a visual confirmation tooltip
    }).catch(err => {
      console.error('Could not copy link text context to clipboard:', err);
    });
  }

}