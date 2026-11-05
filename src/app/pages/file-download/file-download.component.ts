import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DownloadPayload } from '../../core/interface/DownloadPayload';
import {FileService} from "../../core/service/file.service";

@Component({
  selector: 'app-file-download',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss']
})
export class FileDownloadComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly fileService = inject(FileService);

  downloadForm!: FormGroup;
  
  // Decoded payload states cached locally
  token: string | null = null;
  fileName: string = '';
  fileSize: number = 0;
  isPasswordRequired: boolean = false;
  
  // UI conditional rendering and layout state markers
  isExpired: boolean = false;
  remainingDays: number = 0;
  isDownloading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    // 1. Intercept the unique routing token parameter from the URL path context
    this.token = this.route.snapshot.paramMap.get('token');
    
    if (!this.token) {
      this.errorMessage = 'Token invalide.';
      this.isExpired = true;
      return;
    }

    // 2. Decode the incoming token straight away on client layer to build the UI views
    this.decodeAndProcessToken(this.token);
  }

  /**
   * Safely unpacks base64 layout segment strings to read metadata payload variables.
   */
  private decodeAndProcessToken(tokenStr: string): void {
    try {
      const segments = tokenStr.split('.');
      if (segments.length !== 3) {
        throw new Error('Malformed token signature standard.');
      }

      // Parse the second index string block segment representing the payload
      const payloadJson = atob(segments[1]);
      console.info('Decoded payload JSON:', payloadJson);
      const payload: DownloadPayload = JSON.parse(payloadJson);

      this.fileName = payload.fileName;
      console.info('Decoded payload:', payload);
      this.fileSize = payload.fileSize;
      this.isPasswordRequired = payload.isPassReq;

      // 3. Evaluate temporal constraints immediately to toggle step views layout rules
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp >= payload.exp) {
        this.isExpired = true; // Triggers Expired view state
        return;
      }

      // Calculate numeric differences to dynamic colorized info boxes notices
      const secondsLeft = payload.exp - currentTimestamp;
      this.remainingDays = Math.ceil(secondsLeft / (24 * 3600));

      // 4. Initialize Reactive forms validation layers conditional bindings
      this.downloadForm = this.fb.group({
        password: ['', this.isPasswordRequired ? [Validators.required, Validators.minLength(4)] : []]
      });

    } catch (error) {
      console.warn('Decryption routine exception handled gracefully for quality standards:', error);
      this.isExpired = true;
      this.errorMessage = 'This share link is corrupted or has been altered.';
    }
  }

  /**
   * Posts credentials to Spring Boot cluster endpoint and downloads the resulting native attachment.
   */
  onExecuteDownload(): void {
    console.info
    if (this.isExpired || !this.token || (this.isPasswordRequired && this.downloadForm.invalid)) {
      this.errorMessage = this.isExpired || !this.token ? 'Token invalide.' : 'Mot de passe requis.';
      console.debug('Download attempt blocked due to invalid state:', this.errorMessage);
      return;
    }

    this.isDownloading = true;
    this.errorMessage = '';

    const payloadRequest = {
      token: this.token,
      filePassword: this.isPasswordRequired ? this.downloadForm.value.password : null
    };

    // Trigger an explicit POST streaming query receiving raw stream format arrays block context
    this.fileService.downloadFile(payloadRequest).subscribe({
      next: (binaryBlob: Blob) => {
        this.isDownloading = false;
        
        // Generate a clean native browser window down-stream link anchor to trigger file save as dialog
        const blobUrl = window.URL.createObjectURL(binaryBlob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = blobUrl;
        downloadAnchor.download = this.fileName; // Preserves the genuine matching filename
          
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
          
        // Garbage collect transient references
        document.body.removeChild(downloadAnchor);
        window.URL.revokeObjectURL(blobUrl);
      },
      error: (error) => {
          this.isDownloading = false;
          this.errorMessage = 'Téléchargement impossible. Veuillez vérifier le mot de passe renseigné.';
          console.error('Binary payload fetch execution broken:', error);
      }
    });
  }
}
