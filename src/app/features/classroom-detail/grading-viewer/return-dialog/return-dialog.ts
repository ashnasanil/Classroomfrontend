import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-return-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './return-dialog.html',
  styleUrls: ['./return-dialog.css']
})
export class ReturnDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ReturnDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { studentName: string; grade: number | null }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onReturn(): void {
    this.dialogRef.close(true);
  }
}
