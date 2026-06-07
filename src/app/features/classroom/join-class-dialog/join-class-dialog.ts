import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-join-class-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './join-class-dialog.html',
  styleUrls: ['./join-class-dialog.css']
})
export class JoinClassDialog implements OnInit {
  joinForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentUser: User | null = null;

  constructor(
    public dialogRef: MatDialogRef<JoinClassDialog>,
    private fb: FormBuilder,
    private classroomService: ClassroomService,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.joinForm = this.fb.group({
      classCode: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.currentUser = users.find(u => u.id === userId) || null;
        },
        error: (err) => console.error(err)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onJoin(): void {
    if (this.joinForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.classroomService.joinClassroom(this.joinForm.value.classCode).subscribe({
      next: (result: any) => {
        this.isLoading = false;
        this.dialogRef.close(true);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to join classroom. Check the code and try again.';
        console.error(err);
      }
    });
  }
}
