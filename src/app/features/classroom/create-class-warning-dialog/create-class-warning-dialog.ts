import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-class-warning-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, FormsModule],
  templateUrl: './create-class-warning-dialog.html',
  styleUrls: ['./create-class-warning-dialog.css']
})
export class CreateClassWarningDialog {
  agreed: boolean = false;

  constructor(public dialogRef: MatDialogRef<CreateClassWarningDialog>) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onContinue(): void {
    if (this.agreed) {
      this.dialogRef.close(true);
    }
  }
}
