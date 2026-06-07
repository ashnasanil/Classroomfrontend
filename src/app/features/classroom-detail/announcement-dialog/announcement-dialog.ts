import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputDialogComponent } from '../../../shared/components/input-dialog/input-dialog';

export interface Attachment {
  type: 'drive' | 'youtube' | 'upload' | 'link';
  url: string;
  title?: string;
}

@Component({
  selector: 'app-announcement-dialog',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './announcement-dialog.html',
  styleUrls: ['./announcement-dialog.css']
})
export class AnnouncementDialog {
  content: string = '';
  className: string = '';
  attachments: Attachment[] = [];

  constructor(
    public dialogRef: MatDialogRef<AnnouncementDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) {
    if (data && data.className) {
      this.className = data.className;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onPost(): void {
    if (this.content.trim()) {
      this.dialogRef.close({
        content: this.content,
        attachments: this.attachments
      });
    }
  }

  addLink(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: { title: 'Add link', inputLabel: 'Link' }
    });
    dialogRef.afterClosed().subscribe(url => {
      if (url) this.attachments.push({ type: 'link', url, title: url });
    });
  }

  addYouTube(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: { title: 'Add YouTube video', inputLabel: 'YouTube URL', placeholder: 'https://youtube.com/watch?v=...' }
    });
    dialogRef.afterClosed().subscribe(url => {
      if (url) this.attachments.push({ type: 'youtube', url, title: 'YouTube Video' });
    });
  }

  addDrive(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      data: { title: 'Add Google Drive file', inputLabel: 'Drive URL' }
    });
    dialogRef.afterClosed().subscribe(url => {
      if (url) this.attachments.push({ type: 'drive', url, title: 'Google Drive File' });
    });
  }

  triggerFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Normally we would upload here and get the URL back. 
      // For this step, we will pass the File object back to the caller 
      // or we can simulate it if the user wants. But since they want full backend,
      // we'll pass the File back to the Stream component to upload, OR we can upload here.
      // Let's pass it back as a special attachment type that the Stream handles.
      this.attachments.push({ 
        type: 'upload', 
        url: '', // We'll upload it when posting
        title: file.name,
        // @ts-ignore
        file: file 
      });
    }
  }

  removeAttachment(index: number): void {
    this.attachments.splice(index, 1);
  }
}
