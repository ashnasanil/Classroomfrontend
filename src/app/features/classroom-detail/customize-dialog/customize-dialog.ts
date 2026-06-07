import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-customize-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './customize-dialog.html',
  styleUrls: ['./customize-dialog.css']
})
export class CustomizeDialog {
  colors: string[] = ['#1a73e8', '#1e8e3e', '#e52592', '#f29900', '#12b5cb', '#b32824', '#3f51b5', '#5f6368'];
  selectedColor: string = '#e52592';

  constructor(
    public dialogRef: MatDialogRef<CustomizeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { currentColor: string }
  ) {
    if (data && data.currentColor) {
      this.selectedColor = data.currentColor;
    }
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  save() {
    this.dialogRef.close({ themeColor: this.selectedColor });
  }
}
