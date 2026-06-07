import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ClassroomService } from '../../../core/services/classroom.service';

@Component({
  selector: 'app-create-class-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './create-class-dialog.html',
  styleUrls: ['./create-class-dialog.css']
})
export class CreateClassDialog {
  createForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  levelOptions: string[] = [
    'Nursery', 'Reception', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5', 
    'Year 6', 'Year 7', 'Year 8', 'Year 9', 'Year 10', 'Year 11', 'Year 12', 'Year 13',
    'Preschool', 'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade', 
    '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade', '10th Grade', 
    '11th Grade', '12th Grade'
  ];

  constructor(
    public dialogRef: MatDialogRef<CreateClassDialog>,
    private fb: FormBuilder,
    private classroomService: ClassroomService
  ) {
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      section: [''],
      levels: [''],
      subject: [''],
      room: ['']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.createForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = {
      className: this.createForm.value.name,
      section: this.createForm.value.section,
      levels: this.createForm.value.levels,
      subject: this.createForm.value.subject,
      room: this.createForm.value.room
    };

    this.classroomService.createClassroom(payload).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        this.dialogRef.close(true); // Just return true so main-layout knows it succeeded
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create classroom';
        console.error(err);
      }
    });
  }
}
