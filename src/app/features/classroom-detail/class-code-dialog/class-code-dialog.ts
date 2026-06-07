import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Classroom } from '../../../core/services/classroom.service';

@Component({
  selector: 'app-class-code-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './class-code-dialog.html',
  styleUrls: ['./class-code-dialog.css']
})
export class ClassCodeDialog {
  constructor(
    public dialogRef: MatDialogRef<ClassCodeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { classroom: Classroom }
  ) {}

  copyLink(): void {
    const inviteLink = `${window.location.origin}/join?code=${this.data.classroom.classCode}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      // Could show a snackbar here
      alert('Link copied to clipboard');
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
