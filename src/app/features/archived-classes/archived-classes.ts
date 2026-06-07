import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';
import { ClassroomService, Classroom } from '../../core/services/classroom.service';
import { AuthService } from '../../core/services/auth.service';
import { SettingsDialogComponent } from '../classroom-detail/settings/settings-dialog';
import { DeleteDialogComponent } from '../classroom/delete-dialog/delete-dialog';

@Component({
  selector: 'app-archived-classes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    ClipboardModule
  ],
  templateUrl: './archived-classes.html',
  styleUrls: ['./archived-classes.css']
})
export class ArchivedClasses implements OnInit {
  classrooms: Classroom[] = [];
  isLoading = true;

  constructor(
    private classroomService: ClassroomService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private clipboard: Clipboard
  ) {}

  ngOnInit(): void {
    this.loadClassrooms();
  }

  isTeacher(classroom: Classroom): boolean {
    return this.authService.getUserId() === classroom.teacherId;
  }

  getBackgroundImage(id: number): string {
    const images = [
      'url("https://gstatic.com/classroom/themes/img_code.jpg")',
      'url("https://gstatic.com/classroom/themes/img_bookclub.jpg")',
      'url("https://gstatic.com/classroom/themes/Honors.jpg")',
      'url("https://gstatic.com/classroom/themes/img_reachout.jpg")',
      'url("https://gstatic.com/classroom/themes/img_breakfast.jpg")'
    ];
    return `${images[id % images.length]} center / cover no-repeat`;
  }

  getAvatarColor(id: number): string {
    const colors = ['#e91e63', '#1976d2', '#00897b', '#ef6c00', '#8e24aa'];
    return colors[id % colors.length];
  }

  loadClassrooms(): void {
    this.isLoading = true;
    this.classroomService.getClassrooms(true).subscribe({
      next: (data) => {
        this.classrooms = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading classrooms', err);
        this.isLoading = false;
      }
    });
  }

  createClassroom(result: any): void {
      const payload = {
        className: result.name,
        section: result.section,
        subject: result.subject,
        room: result.room
      };
      
      this.classroomService.createClassroom(payload).subscribe({
        next: (classroom) => {
          this.loadClassrooms();
        },
        error: (err) => {
          console.error('Error creating classroom', err);
          alert('Error creating classroom. Make sure backend is running.');
        }
      });
  }

  openFolder(id: number): void {
    // Navigate to Google Drive folder for this class
    // In a real app, this would use a specific Drive Folder ID
    window.open('https://drive.google.com/drive/my-drive', '_blank');
  }

  openGradebook(id: number): void {
    const cls = this.classrooms.find(c => c.id === id);
    if (cls && this.isTeacher(cls)) {
      this.router.navigate(['/classroom', id, 'grades']);
    } else {
      // Students have a "Your work" page instead of gradebook
      this.router.navigate(['/classroom', id, 'student-work']);
    }
  }

  moveClass(cls: Classroom): void {
    this.snackBar.open('Move functionality coming soon', 'Close', { duration: 3000 });
  }

  copyInviteLink(cls: Classroom): void {
    if (cls.classCode) {
      const inviteUrl = `${window.location.origin}/join?code=${cls.classCode}`;
      this.clipboard.copy(inviteUrl);
      this.snackBar.open('Invite link copied', 'Close', { duration: 3000 });
    }
  }

  editClass(cls: Classroom): void {
    if (!this.isTeacher(cls)) {
      this.snackBar.open('Only the teacher can edit this class', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      panelClass: 'settings-dialog-container',
      data: { classroomId: cls.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'saved') {
        this.loadClassrooms();
      }
    });
  }

  copyClass(cls: Classroom): void {
    if (!this.isTeacher(cls)) {
      this.snackBar.open('Only the teacher can copy this class', 'Close', { duration: 3000 });
      return;
    }
    
    this.classroomService.copyClassroom(cls.id).subscribe({
      next: () => {
        this.snackBar.open('Class copied successfully', 'Close', { duration: 3000 });
        this.loadClassrooms();
      },
      error: (err: any) => {
        console.error('Error copying classroom', err);
        this.snackBar.open('Failed to copy class', 'Close', { duration: 3000 });
      }
    });
  }

  restoreClass(cls: Classroom): void {
    if (!this.isTeacher(cls)) {
      this.snackBar.open('Only the teacher can restore this class', 'Close', { duration: 3000 });
      return;
    }

    this.classroomService.restoreClassroom(cls.id).subscribe({
      next: () => {
        this.snackBar.open('Class restored', 'Close', { duration: 3000 });
        this.classrooms = this.classrooms.filter(c => c.id !== cls.id);
      },
      error: (err: any) => {
        console.error('Error restoring classroom', err);
        this.snackBar.open('Failed to restore class', 'Close', { duration: 3000 });
      }
    });
  }

  deleteClass(cls: Classroom): void {
    if (!this.isTeacher(cls)) {
      this.snackBar.open('Only the teacher can delete this class', 'Close', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: '450px',
      panelClass: 'delete-dialog-container',
      data: { classroom: cls }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.classroomService.deleteClassroom(cls.id).subscribe({
          next: () => {
            this.snackBar.open('Class deleted', 'Close', { duration: 3000 });
            this.classrooms = this.classrooms.filter(c => c.id !== cls.id);
          },
          error: (err: any) => {
            console.error('Error deleting classroom', err);
            this.snackBar.open('Failed to delete class', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}
