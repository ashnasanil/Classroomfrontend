import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ClassroomService, Classroom } from '../../../core/services/classroom.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { InviteDialogComponent } from './invite-dialog';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './people.html',
  styleUrls: ['./people.css']
})
export class People implements OnInit {
  classroomId: number = 0;
  classroom: any = null;
  role: string | null = '';
  students: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private classroomService: ClassroomService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.classroomId = +id;
        this.loadClassroomDetails();
      }
    });
  }

  loadClassroomDetails(): void {
    this.classroomService.getClassroomDetails(this.classroomId).subscribe({
      next: (data: any) => {
        this.classroom = data;
        const currentUserId = this.authService.getUserId();
        if (this.classroom && currentUserId === this.classroom.teacherId) {
          this.role = 'Teacher';
        } else {
          this.role = 'Student';
        }
        
        if (this.classroom && this.classroom.members) {
          this.students = this.classroom.members.filter((m: any) => m.membershipType === 'Student');
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  openInviteDialog(type: 'students' | 'teachers'): void {
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '500px',
      panelClass: 'invite-dialog-panel',
      data: {
        type: type,
        classCode: this.classroom?.classCode || 'default'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.email) {
        this.classroomService.inviteUser(this.classroomId, result.email, result.role).subscribe({
          next: () => {
             // Refresh classroom details
             this.loadClassroomDetails();
          },
          error: (err: any) => {
             console.error('Failed to invite user', err);
             // Optionally show an error message using MatSnackBar
          }
        });
      }
    });
  }
}
