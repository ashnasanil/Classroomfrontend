import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { AssignmentService, Assignment } from '../../../core/services/assignment.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-assignment-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './assignment-detail.html',
  styleUrls: ['./assignment-detail.css']
})
export class AssignmentDetail implements OnInit {
  assignmentId: number = 0;
  classroomId: number = 0;
  assignment: Assignment | null = null;
  role: 'Teacher' | 'Student' = 'Student';
  currentUserInitial: string = '';
  currentUserName: string = '';
  
  newComment: string = '';
  selectedTabIndex: number = 0;
  
  currentSort: string = 'Sort by status';
  currentFilter: string = 'All';

  // Student specific logic
  submissionStatus: 'Assigned' | 'Turned in' | 'Graded' = 'Assigned';
  isSubmitting: boolean = false;
  mySubmissionId: number | null = null;
  mySubmissionComments: any[] = [];
  newPrivateComment: string = '';
  attachedFileUrl: string | null = null;
  attachedFileName: string | null = null;
  uploadingFile: boolean = false;
  selectedFile: File | null = null;

  // Teacher specific logic
  studentsList: any[] = [];
  turnedInCount: number = 0;
  assignedCount: number = 0;
  gradedCount: number = 0;

  get turnedInStudents() { return this.studentsList.filter(s => s.status === 'Turned in'); }
  get assignedStudents() { return this.studentsList.filter(s => s.status === 'Assigned'); }
  get gradedStudents() { return this.studentsList.filter(s => s.status === 'Graded'); }

  // Teacher Grading UI
  selectedStudentForPreview: any = null;
  draftGrades: { [studentId: number]: number | null } = {};
  selectedStudents: Set<number> = new Set();
  returnComment: string = '';

  @ViewChild('fileInput') fileInput: any;
  @ViewChild('turnInDialog') turnInDialog!: TemplateRef<any>;
  @ViewChild('returnDialog') returnDialog!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private classroomService: ClassroomService,
    private assignmentService: AssignmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const username = this.authService.getUsername();
    if (username) {
      this.currentUserName = username;
      this.currentUserInitial = username.charAt(0).toUpperCase();
    }
    
    if (this.route.parent) {
      combineLatest([
        this.route.paramMap,
        this.route.parent.paramMap
      ]).subscribe(([params, parentParams]) => {
        const idParam = params.get('assignmentId');
        const cidParam = parentParams.get('id');
        
        if (idParam && cidParam) {
          this.assignmentId = +idParam;
          this.classroomId = +cidParam;
          this.loadAssignmentDetails();
          this.loadClassroomRole();
        }
      });
    } else {
      // Fallback if no parent (unlikely given routes)
      this.route.paramMap.subscribe(params => {
        const idParam = params.get('assignmentId');
        if (idParam) {
          this.assignmentId = +idParam;
          this.loadAssignmentDetails();
          this.loadClassroomRole();
        }
      });
    }
  }

  classroomData: any = null;

  loadClassroomRole(): void {
    this.classroomService.getClassroomDetails(this.classroomId).subscribe({
      next: (data: any) => {
        this.classroomData = data;
        const currentUserId = this.authService.getUserId();
        if (data && currentUserId === data.teacherId) {
          this.role = 'Teacher';
          this.selectedTabIndex = 0; // Default to Instructions for teachers too as requested
          this.loadTeacherSubmissions(data);
        } else {
          this.role = 'Student';
          this.selectedTabIndex = 0; // Default to Instructions for students
          this.loadSubmissionStatus();
        }
      }
    });
  }

  loadAssignmentDetails(): void {
    console.log(`Loading details for assignmentId: ${this.assignmentId}, classroomId: ${this.classroomId}`);
    // Fetch all assignments and find the one we need
    this.assignmentService.getAssignments(this.classroomId).subscribe({
      next: (assignments) => {
        console.log('Fetched assignments:', assignments);
        this.assignment = assignments.find(a => a.id == this.assignmentId) || null;
        console.log('Found assignment:', this.assignment);
        
        // As a fallback, if assignmentId is 0 or not found but there are assignments, just grab the first one to avoid blank page
        if (!this.assignment && assignments.length > 0) {
           console.log('Assignment not found by ID, falling back to first assignment');
           this.assignment = assignments[0];
           this.assignmentId = this.assignment.id || 0;
        } else if (!this.assignment) {
           console.log('No assignments in DB, creating a dummy one to show the UI');
           this.assignment = {
             id: 999,
             classroomId: this.classroomId,
             title: 'Sample Assignment',
             description: 'This is a sample assignment because there are none in the database.',
             points: 100,
             dueDate: new Date().toISOString(),
             createdAt: new Date().toISOString(),
             teacherName: 'Teacher'
           } as any;
           this.assignmentId = 999;
        }

        // We re-call loadClassroomRole so teacher submissions load with the correct assignmentId
        if (this.role === 'Teacher') {
           this.loadClassroomRole();
        }
      },
      error: (err) => console.error('Error fetching assignments:', err)
    });
  }

  editAssignment(): void {
    if (this.assignmentId) {
      this.router.navigate(['/classroom', this.classroomId, 'create'], { queryParams: { edit: this.assignmentId } });
    }
  }

  deleteAssignment(): void {
    if (this.assignmentId && confirm('Are you sure you want to delete this assignment?')) {
      this.assignmentService.deleteAssignment(this.classroomId, this.assignmentId).subscribe({
        next: () => {
          this.router.navigate(['/classroom', this.classroomId, 'classwork']);
        },
        error: (err) => {
          console.error('Error deleting assignment', err);
          alert('Failed to delete assignment');
        }
      });
    }
  }

  copyLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      // In a real app, use MatSnackBar here
      alert('Link copied to clipboard');
    }).catch(err => {
      console.error('Could not copy link: ', err);
    });
  }

  sendComment(): void {
    if (!this.newComment.trim() || !this.assignment) return;
    
    const commentText = this.newComment;
    this.newComment = ''; // Optimistic clear

    this.assignmentService.addAssignmentComment(this.classroomId, this.assignmentId, commentText).subscribe({
      next: (comment) => {
        if (!this.assignment!.comments) {
          this.assignment!.comments = [];
        }
        this.assignment!.comments.push(comment);
      },
      error: (err) => {
        console.error('Error adding comment', err);
        this.newComment = commentText; // Restore on fail
        alert('Failed to add comment');
      }
    });
  }

  loadTeacherSubmissions(classroomData: any): void {
    const students = classroomData.members?.filter((m: any) => m.membershipType === 'Student') || [];
    
    this.assignmentService.getAssignmentSubmissions(this.classroomId, this.assignmentId).subscribe({
      next: (submissions) => {
        this.studentsList = students.map((st: any) => {
          const sub = submissions.find((s: any) => s.studentId == st.userId);
          let fileName = null;
          if (sub?.attachmentUrl) {
            const parts = sub.attachmentUrl.split('/');
            fileName = parts[parts.length - 1];
          }
          
          let status = 'Assigned';
          if (sub) {
            status = sub.isGraded ? 'Graded' : 'Turned in';
          }
          
          return {
            ...st,
            status,
            submissionId: sub?.id,
            attachmentUrl: sub?.attachmentUrl,
            attachmentFileName: fileName,
            score: sub?.score
          };
        });
        this.turnedInCount = this.studentsList.filter(s => s.status === 'Turned in').length;
        this.assignedCount = this.studentsList.filter(s => s.status === 'Assigned').length;
        this.gradedCount = this.studentsList.filter(s => s.status === 'Graded').length;
        
        // Initialize draftGrades
        this.studentsList.forEach(s => {
          if (s.score !== undefined && s.score !== null) {
            this.draftGrades[s.userId] = s.score;
          }
        });
      },
      error: (err) => console.error('Error fetching submissions:', err)
    });
  }

  onPointsChange(event: any): void {
    if (!this.assignment) return;
    const val = event.target.value;
    if (val === 'Ungraded' || val === '') {
      this.assignment.points = null;
    } else if (!isNaN(Number(val))) {
      this.assignment.points = Number(val);
    }
    this.updateAssignment();
  }

  setUngraded(): void {
    if (this.assignment) {
      this.assignment.points = null;
      this.updateAssignment();
    }
  }

  updateAssignment(): void {
    if (!this.assignment) return;
    const data = {
      title: this.assignment.title,
      description: this.assignment.description,
      attachmentUrl: this.assignment.attachmentUrl,
      points: this.assignment.points,
      dueDate: this.assignment.dueDate
    };
    
    this.assignmentService.updateAssignment(this.classroomId, this.assignmentId, data).subscribe({
      next: () => {
        // Points updated successfully
      },
      error: (err) => console.error('Error updating assignment:', err)
    });
  }

  mySubmissionScore: number | null = null;

  loadSubmissionStatus(): void {
    if (this.role !== 'Student') return;
    
    this.assignmentService.getAssignmentSubmissions(this.classroomId, this.assignmentId).subscribe({
      next: (submissions) => {
        const currentUserId = this.authService.getUserId();
        const mySubmission = submissions.find(s => s.studentId === currentUserId);
        if (mySubmission) {
          this.mySubmissionId = mySubmission.id;
          this.mySubmissionComments = mySubmission.comments || [];
          this.submissionStatus = mySubmission.isGraded ? 'Graded' : 'Turned in';
          this.mySubmissionScore = mySubmission.score !== undefined ? mySubmission.score : null;
          this.attachedFileUrl = mySubmission.attachmentUrl || null;
          if (this.attachedFileUrl) {
            const parts = this.attachedFileUrl.split('/');
            this.attachedFileName = parts[parts.length - 1];
          }
        } else {
          this.submissionStatus = 'Assigned';
        }
      },
      error: (err) => console.error('Failed to load submission status', err)
    });
  }

  triggerGoogleDrive(): void {
    const link = prompt('Please enter the Google Drive link for your submission:');
    if (link) {
      this.attachedFileUrl = link;
      this.attachedFileName = 'Google Drive Link';
    }
  }

  triggerLink(): void {
    const link = prompt('Please enter a link:');
    if (link) {
      this.attachedFileUrl = link;
      this.attachedFileName = link;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.isSubmitting = true;
      this.assignmentService.uploadFile(file).subscribe({
        next: (response: any) => {
          // Assuming the response returns an object with the URL, e.g., { filePath: '...' }
          // Or if it returns a plain string, we need to handle that.
          this.attachedFileUrl = response.filePath || response.url || response;
          this.attachedFileName = file.name;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('File upload failed', err);
          this.isSubmitting = false;
          alert('File upload failed');
        }
      });
    }
  }

  removeAttachment(): void {
    this.attachedFileUrl = null;
    this.attachedFileName = null;
  }

  openTurnInDialog(): void {
    this.dialog.open(this.turnInDialog, {
      width: '400px',
      panelClass: 'turn-in-dialog-panel'
    });
  }

  confirmTurnIn(): void {
    this.dialog.closeAll();
    this.markAsDone();
  }

  unsubmit(): void {
    if (!this.assignmentId || !confirm('Are you sure you want to unsubmit your work?')) return;
    this.isSubmitting = true;
    this.assignmentService.unsubmitAssignment(this.classroomId, this.assignmentId).subscribe({
      next: () => {
        this.submissionStatus = 'Assigned';
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error unsubmitting', err);
        alert('Failed to unsubmit');
        this.isSubmitting = false;
      }
    });
  }

  sendPrivateComment(): void {
    if (!this.newPrivateComment.trim() || !this.mySubmissionId) return;
    const commentText = this.newPrivateComment;
    this.newPrivateComment = '';
    
    this.assignmentService.addSubmissionComment(this.classroomId, this.mySubmissionId, commentText).subscribe({
      next: (comment) => {
        this.mySubmissionComments.push(comment);
      },
      error: (err) => {
        console.error('Error adding private comment', err);
        this.newPrivateComment = commentText;
        alert('Failed to add private comment');
      }
    });
  }

  openAttachment(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  openGradingViewer(studentId: number): void {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/classrooms', this.classroomId, 'assignments', this.assignmentId, 'grade', studentId])
    );
    window.open(url, '_blank');
  }

  markAsDone(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    
    const submissionData = {
      attachmentUrl: this.attachedFileUrl,
      textResponse: null
    };
    
    this.assignmentService.submitAssignment(this.classroomId, this.assignmentId, submissionData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submissionStatus = 'Turned in';
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to submit assignment', err);
      }
    });
  }

  // Grading Logic Methods
  selectStudent(student: any): void {
    this.selectedStudentForPreview = student;
  }

  toggleStudentSelection(student: any, event: any): void {
    if (event.checked) {
      this.selectedStudents.add(student.userId);
    } else {
      this.selectedStudents.delete(student.userId);
    }
  }

  toggleAllStudents(event: any): void {
    if (event.checked) {
      this.studentsList.forEach(s => this.selectedStudents.add(s.userId));
    } else {
      this.selectedStudents.clear();
    }
  }

  onGradeChange(studentId: number, event: any): void {
    let val = parseInt(event.target.value);
    if (!isNaN(val)) {
      this.draftGrades[studentId] = val;
    } else {
      this.draftGrades[studentId] = null;
    }
    // Automatically select the student if a grade is typed
    if (!this.selectedStudents.has(studentId)) {
       this.selectedStudents.add(studentId);
    }
  }

  openReturnDialog(): void {
    if (this.selectedStudents.size === 0) return;
    this.returnComment = '';
    const dialogRef = this.dialog.open(this.returnDialog, {
      width: '500px',
      panelClass: 'return-dialog'
    });
  }

  getSelectedStudentsList(): any[] {
    return this.studentsList.filter(s => this.selectedStudents.has(s.userId));
  }

  isReturning = false;

  returnWork(): void {
    if (this.isReturning) return;
    this.isReturning = true;

    const requests: Promise<any>[] = [];
    let gradedCount = 0;
    let skippedCount = 0;

    this.selectedStudents.forEach(studentId => {
      const student = this.studentsList.find(s => s.userId === studentId);
      if (student) {
        const score = this.draftGrades[studentId] || 0;
        const gradeData = { score, teacherFeedback: this.returnComment };
        // Use firstValueFrom or toPromise (using subscribe here to wrap in promise)
        requests.push(new Promise((resolve, reject) => {
           this.assignmentService.gradeStudent(this.classroomId, this.assignmentId, student.userId, gradeData).subscribe({
              next: () => { gradedCount++; resolve(true); },
              error: (err) => reject(err)
           });
        }));
      } else {
        skippedCount++;
      }
    });

    if (requests.length === 0) {
       this.dialog.closeAll();
       this.isReturning = false;
       alert(`Cannot return grades.`);
       return;
    }

    Promise.all(requests).then(() => {
      this.isReturning = false;
      this.dialog.closeAll();
      if (this.classroomData) {
        this.loadTeacherSubmissions(this.classroomData);
      }
      this.selectedStudents.clear();
      this.selectedStudentForPreview = null;
      let msg = `Successfully returned ${gradedCount} grade(s).`;
      alert(msg);
    }).catch(err => {
      this.isReturning = false;
      console.error('Error returning work', err);
      alert('Error returning work. Please try again.');
    });
  }
}
