import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { ReturnDialogComponent } from './return-dialog/return-dialog';

@Component({
  selector: 'app-grading-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatButtonModule, MatIconModule, MatSnackBarModule, MatTooltipModule, MatMenuModule, MatDialogModule],
  templateUrl: './grading-viewer.html',
  styleUrl: './grading-viewer.css',
})
export class GradingViewerComponent implements OnInit {
  classroomId!: number;
  assignmentId!: number;
  currentStudentId!: number;
  
  assignment: any;
  classroomData: any;
  
  studentsList: any[] = [];
  currentStudentIndex: number = -1;
  currentStudent: any;

  draftGrade: number | null = null;
  privateComment: string = '';
  
  loggedInUserName: string = 'T';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const username = this.authService.getUsername();
    if (username) {
      this.loggedInUserName = username;
    }
    
    this.route.paramMap.subscribe(params => {
      this.classroomId = Number(params.get('classroomId'));
      this.assignmentId = Number(params.get('assignmentId'));
      this.currentStudentId = Number(params.get('studentId'));

      this.loadAssignmentDetails();
      this.loadClassroomAndSubmissions();
    });
  }

  loadAssignmentDetails(): void {
    this.assignmentService.getAssignments(this.classroomId).subscribe({
      next: (assignments: any[]) => {
        this.assignment = assignments.find((a: any) => a.id === this.assignmentId) || null;
      },
      error: (err: any) => console.error('Error fetching assignment', err)
    });
  }

  loadClassroomAndSubmissions(): void {
    this.classroomService.getClassroomDetails(this.classroomId).subscribe({
      next: (classroomData: any) => {
        this.classroomData = classroomData;
        const students = (classroomData.members || []).filter((m: any) => m.membershipType === 'Student');
        
        this.assignmentService.getAssignmentSubmissions(this.classroomId, this.assignmentId).subscribe({
          next: (submissions: any[]) => {
            this.studentsList = students.map((student: any) => {
              const submission = submissions.find(s => s.studentId === student.userId);
              return {
                userId: student.userId,
                firstName: student.firstName,
                lastName: student.lastName,
                status: submission ? (submission.isGraded ? 'Graded' : 'Turned in') : 'Assigned',
                submissionId: submission ? submission.id : null,
                attachmentUrl: submission ? submission.attachmentUrl : null,
                score: submission ? submission.score : null,
                submittedAt: submission ? submission.submittedAt : null,
                teacherFeedback: submission ? submission.teacherFeedback : null,
                comments: submission ? (submission.comments || []) : []
              };
            });

            this.updateCurrentStudent();
          },
          error: (err) => console.error('Error fetching submissions', err)
        });
      },
      error: (err) => console.error('Error fetching classroom details', err)
    });
  }

  isStudentDropdownOpen: boolean = false;
  studentSortBy: 'firstName' | 'lastName' | 'status' = 'firstName';

  toggleStudentDropdown(): void {
    this.isStudentDropdownOpen = !this.isStudentDropdownOpen;
  }

  setSortBy(sort: 'firstName' | 'lastName' | 'status'): void {
    this.studentSortBy = sort;
    this.sortStudents();
  }

  sortStudents(): void {
    if (this.studentSortBy === 'firstName') {
      this.studentsList.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || ''));
    } else if (this.studentSortBy === 'lastName') {
      this.studentsList.sort((a, b) => (a.lastName || '').localeCompare(b.lastName || ''));
    } else if (this.studentSortBy === 'status') {
      // Custom status sort order: Graded, Turned in, Assigned
      const statusOrder: Record<string, number> = { 'Graded': 1, 'Turned in': 2, 'Assigned': 3 };
      this.studentsList.sort((a, b) => {
        const aOrder = statusOrder[a.status] || 99;
        const bOrder = statusOrder[b.status] || 99;
        return aOrder - bOrder;
      });
    }
    
    // Refresh current student index after sort
    if (this.currentStudentId) {
      this.currentStudentIndex = this.studentsList.findIndex(s => s.userId === this.currentStudentId);
    }
  }

  selectStudent(studentId: number): void {
    this.currentStudentId = studentId;
    this.updateCurrentStudent();
    this.isStudentDropdownOpen = false;
  }

  updateCurrentStudent(): void {
    this.currentStudentIndex = this.studentsList.findIndex(s => s.userId === this.currentStudentId);
    if (this.currentStudentIndex !== -1) {
      this.currentStudent = this.studentsList[this.currentStudentIndex];
      this.draftGrade = this.currentStudent.score;
      this.privateComment = '';
    } else if (this.studentsList.length > 0) {
      this.currentStudentIndex = 0;
      this.currentStudentId = this.studentsList[0].userId;
      this.currentStudent = this.studentsList[0];
      this.draftGrade = this.currentStudent.score;
      this.privateComment = '';
    }
  }

  goToPreviousStudent(): void {
    if (this.currentStudentIndex > 0) {
      this.currentStudentIndex--;
      this.currentStudentId = this.studentsList[this.currentStudentIndex].userId;
      this.updateCurrentStudent();
    }
  }

  goToNextStudent(): void {
    if (this.currentStudentIndex < this.studentsList.length - 1) {
      this.currentStudentIndex++;
      this.currentStudentId = this.studentsList[this.currentStudentIndex].userId;
      this.updateCurrentStudent();
    }
  }

  goToAssignmentDashboard(): void {
    this.router.navigate(['/classroom', this.classroomId, 'assignment', this.assignmentId]);
  }

  isReturning = false;

  returnGrade(): void {
    if (!this.currentStudent || this.isReturning) {
      return;
    }
    
    const dialogRef = this.dialog.open(ReturnDialogComponent, {
      width: '450px',
      data: {
        studentName: `${this.currentStudent.firstName} ${this.currentStudent.lastName}`,
        grade: this.draftGrade
      },
      panelClass: 'custom-return-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isReturning = true;

        const gradeData = {
          score: this.draftGrade || 0,
          teacherFeedback: this.privateComment
        };

        this.assignmentService.gradeStudent(this.classroomId, this.assignmentId, this.currentStudent.userId, gradeData).subscribe({
          next: () => {
            this.isReturning = false;
            this.snackBar.open('Grade returned successfully!', 'OK', { 
              duration: 3000, 
              horizontalPosition: 'left',
              verticalPosition: 'bottom'
            });
            this.loadClassroomAndSubmissions();
          },
          error: (err) => {
            this.isReturning = false;
            console.error('Error grading submission', err);
            this.snackBar.open('Failed to return grade. ' + err.message, 'Close', { 
              duration: 5000,
              horizontalPosition: 'left',
              verticalPosition: 'bottom'
            });
          }
        });
      }
    });
  }

  sendComment(): void {
    if (!this.privateComment.trim() || !this.currentStudent || !this.currentStudent.submissionId) return;
    const commentText = this.privateComment;
    this.privateComment = '';
    
    this.assignmentService.addSubmissionComment(this.classroomId, this.currentStudent.submissionId, commentText).subscribe({
      next: (comment) => {
        this.currentStudent.comments.push(comment);
      },
      error: (err) => {
        console.error('Error adding private comment', err);
        this.privateComment = commentText;
        this.snackBar.open('Failed to add comment', 'Close', { duration: 3000 });
      }
    });
  }

  isImage(url: string | null): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif') || lower.endsWith('.webp');
  }

  isIframeable(url: string | null): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.pdf') || lower.endsWith('.txt');
  }

  getFullAttachmentUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Replace /api with empty string to get base url since uploads are at root
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  getSafeUrl(url: string | null): SafeResourceUrl | null {
    const fullUrl = this.getFullAttachmentUrl(url);
    if (!fullUrl) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);
  }

  openAttachment(url: string | null): void {
    const fullUrl = this.getFullAttachmentUrl(url);
    if (fullUrl) {
      window.open(fullUrl, '_blank');
    }
  }
}
