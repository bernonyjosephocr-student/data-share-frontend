import { Component, inject } from '@angular/core';
import { Router} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FileService } from '../../core/service/file.service';
import { UI_CONSTRAINTS } from '../../core/config/validation.constraints';

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
  private readonly constraints = UI_CONSTRAINTS;

  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (!fileList || fileList.length === 0) {
      return;
    }
  
    const file = fileList[0];

    if (file.size > this.constraints.upload.file.maxSizeInBytes) {
      this.errorMessage = this.constraints.upload.file.errorTooLarge;
      return;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension && this.constraints.upload.file.forbiddenExtensions.includes(`.${fileExtension}`)) {
      this.errorMessage = this.constraints.upload.file.errorBadExtension;
      return;
    }
    this.fileService.currentFileToUpload = file;
    void this.router.navigate(['/upload']);
  }
}
