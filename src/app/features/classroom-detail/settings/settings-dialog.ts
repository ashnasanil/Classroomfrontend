import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ClassroomService } from '../../../core/services/classroom.service';

@Component({
  selector: 'app-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './settings-dialog.html',
  styleUrls: ['./settings-dialog.css']
})
export class SettingsDialogComponent implements OnInit {
  isSaving = false;
  
  levelOptions: string[] = [
    'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 
    'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13',
    'Preschool', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', 
    '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', 
    '11th Grade', '12th Grade'
  ];

  settings: any = {
    className: '',
    description: '',
    section: '',
    room: '',
    subject: '',
    levels: '',
    
    inviteCodesEnabled: true,
    classCode: '',
    
    streamPostPermission: 'Students can post and comment',
    classworkOnStream: 'Show condensed notifications',
    showDeletedItems: false,
    
    applyDraftGradeToMissing: true,
    missingAssignmentDefaultGrade: 0,
    overallGradeCalculation: 'No overall grade',
    showOverallGradeToStudents: false
  };

  constructor(
    public dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { classroomId: number, classroom: any },
    private classroomService: ClassroomService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    if (this.data.classroom) {
      this.settings = { ...this.settings, ...this.data.classroom };
    }
  }

  onSave(): void {
    if (!this.settings.className) {
      this.snackBar.open('Class name is required', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    
    // Call our new backend API endpoint to update settings
    this.classroomService.updateClassroomSettings(this.data.classroomId, this.settings).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.snackBar.open('Settings saved', 'Close', { duration: 3000 });
        this.dialogRef.close(response);
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('Failed to save settings', err);
        this.snackBar.open('Failed to save settings: ' + (err.error?.message || err.message), 'Close', { duration: 5000 });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
