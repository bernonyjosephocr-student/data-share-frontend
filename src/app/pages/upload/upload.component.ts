import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileService } from '../../core/service/file.service';
import { Router } from '@angular/router';
import { FileMetadata } from '../../core/interface/FileMetadata';
import { UserService } from '../../core/service/user.service';
import { UI_CONSTRAINTS } from '../../core/config/validation.constraints';

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

  private readonly constraints = UI_CONSTRAINTS;

    // Starts directly on step 2 since step 1 is processed inside HomeComponent
  currentStep: 'FILL_METADATA' | 'UPLOAD_SUCCESS' = 'FILL_METADATA';
  // Initialized in ngOnInit
  uploadForm: FormGroup = new FormGroup({}); 

  //Here, a list is set but limited to only one file. A configuration point wille be set for the number of files supported
  selectedFiles: File[] = [];
  tagInput: string = '';
  tags: Set<string> = new Set<string>();
  isTagsVisible: boolean = false; // Controls the visibility of the tag input field and tag list

  // Holds the download token returned by the backend
  generatedDownloadToken: string = '';

  isUploading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
      // Get the file selected in HomeComponent and validate it here.
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
      filePassword: ['', [Validators.minLength(this.constraints.upload.file.password.minLength)]],
      retentionDays: [this.constraints.upload.retention.defaultDays, [Validators.required, Validators.min(this.constraints.upload.retention.minDays), Validators.max(this.constraints.upload.retention.maxDays)]],
      tagInput: ['', [Validators.minLength(this.constraints.upload.tag.minLength), Validators.maxLength(this.constraints.upload.tag.maxLength)]] // This field is used for adding tags, but not part of the final metadata
    });
    // Adding a listener to the password field
    this.uploadForm.get('filePassword')?.valueChanges.subscribe(() => {
      const passwordControl = this.uploadForm.get('filePassword');
      
      if (passwordControl?.hasError('minlength')) {
        // Met à jour instantanément le message d'erreur affiché par le HTML
        this.errorMessage = this.constraints.upload.file.password.errorMinLength;
      } else {
        // Efface le message d'erreur dès que la longueur est correcte (ou si le champ est vidé)
        this.errorMessage = '';
      }
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
      this.tags.add(cleanTag);
    if (cleanTag && cleanTag.length >= this.constraints.upload.tag.minLength && cleanTag.length <= this.constraints.upload.tag.maxLength && !this.tags.has(cleanTag)) {
      this.tags.add(cleanTag);
    }else {
      this.errorMessage = this.constraints.upload.tag.errorLength;
    }
    this.errorMessage= '';
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.tags.delete(tag);
  }

  onUpload(): void {
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
        // Handling the error message
        if (error.error && typeof error.error === 'object' && error.error.message) {
          // JSON msg
          this.errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          // Text msg
          this.errorMessage = error.error;
        } else if (error.status === 500) {
          // Server down
          this.errorMessage = 'Impossible de joindre le serveur. Veuillez vérifier votre connexion.';
        } else {
          // Worst case
          this.errorMessage = `Erreur (${error.status}) : ${error.statusText || 'Transmission impossible.'}`;
        }
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