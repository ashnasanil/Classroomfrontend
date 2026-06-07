import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClassroomService, Gradebook, GradebookAssignment } from '../../../core/services/classroom.service';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatSelectModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './grades.html',
  styleUrls: ['./grades.css']
})
export class Grades implements OnInit {
  classroomId: number = 0;
  gradebook: Gradebook | null = null;
  isLoading = true;
  sortOption = 'lastName';

  constructor(
    private route: ActivatedRoute,
    private classroomService: ClassroomService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.classroomId = +id;
        this.loadGradebook();
      }
    });
  }

  loadGradebook(): void {
    this.isLoading = true;
    this.classroomService.getGradebook(this.classroomId).subscribe({
      next: (data) => {
        this.gradebook = data;
        this.sortStudents();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading gradebook', err);
        this.isLoading = false;
      }
    });
  }

  sortStudents(): void {
    if (!this.gradebook) return;
    
    this.gradebook.students.sort((a, b) => {
      const nameA = this.sortOption === 'lastName' ? a.lastName || '' : a.firstName || '';
      const nameB = this.sortOption === 'lastName' ? b.lastName || '' : b.firstName || '';
      return nameA.localeCompare(nameB);
    });
  }

  onSortChange(event: any): void {
    this.sortOption = event.value;
    this.sortStudents();
  }

  getStudentGrade(studentId: number, assignmentId: number): number | string {
    if (!this.gradebook) return '';
    const sub = this.gradebook.submissions.find(s => s.studentId === studentId && s.assignmentId === assignmentId);
    if (!sub || sub.grade === null || sub.grade === undefined) return '';
    return sub.grade;
  }

  getClassAverage(assignmentId?: number): number | string {
    if (!this.gradebook || this.gradebook.submissions.length === 0) return '';
    
    let subs = this.gradebook.submissions;
    if (assignmentId) {
      subs = subs.filter(s => s.assignmentId === assignmentId);
    }
    
    const gradedSubs = subs.filter(s => s.grade !== null && s.grade !== undefined);
    if (gradedSubs.length === 0) return '';
    
    const sum = gradedSubs.reduce((acc, curr) => acc + (curr.grade || 0), 0);
    return Math.round(sum / gradedSubs.length);
  }

  notImplemented(): void {
    this.snackBar.open('This action is coming soon', 'Close', { duration: 3000 });
  }
}
