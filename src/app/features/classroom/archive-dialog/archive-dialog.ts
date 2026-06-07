import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Classroom } from '../../../core/services/classroom.service';

@Component({
  selector: 'app-archive-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './archive-dialog.html',
  styleUrls: ['./archive-dialog.css']
})
export class ArchiveDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ArchiveDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classroom: Classroom }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onArchive(): void {
    this.dialogRef.close(true);
  }
}
