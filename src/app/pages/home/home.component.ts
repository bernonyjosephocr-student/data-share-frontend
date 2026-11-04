import { Component, inject } from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from '../../core/service/file.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly fileService = inject(FileService);
  private readonly router = inject(Router);

  errorMessage: string = '';
  private readonly MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB
  private readonly FORBIDDEN_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh'];

  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }
  
    const file = fileList[0];

    if (file.size > this.MAX_FILE_SIZE_BYTES) {
      this.errorMessage = 'The file selected exceeds the maximum allowed size of 1 GB.';
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && this.FORBIDDEN_EXTENSIONS.includes(`.${fileExtension}`)) {
      this.errorMessage = 'The file type is not allowed.';
      return;
    }
    this.fileService.currentFileToUpload = file;
    void this.router.navigate(['/upload']);
  }
}
