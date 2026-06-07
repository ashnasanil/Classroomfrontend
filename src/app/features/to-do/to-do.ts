import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AssignmentService, Assignment } from '../../core/services/assignment.service';
import { ClassroomService, Classroom } from '../../core/services/classroom.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-to-do',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    FormsModule
  ],
  templateUrl: './to-do.html',
  styleUrls: ['./to-do.css']
})
export class ToDo implements OnInit {
  assignments: Assignment[] = [];
  classrooms: Classroom[] = [];
  selectedClassroomId: number | null = null; // null = "All classes"

  // Lists
  assignedWork: Assignment[] = [];
  missingWork: Assignment[] = [];
  doneWork: Assignment[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClassrooms();
    this.loadAssignments();
  }

  loadClassrooms(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (data: Classroom[]) => {
        this.classrooms = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  loadAssignments(): void {
    this.assignmentService.getUserAssignments().subscribe({
      next: (data: Assignment[]) => {
        this.assignments = data;
        this.filterAndGroupAssignments();
      },
      error: (err: any) => console.error(err)
    });
  }

  onClassroomFilterChange(): void {
    this.filterAndGroupAssignments();
  }

  filterAndGroupAssignments(): void {
    const now = new Date().getTime();

    // 1. Filter by selected classroom
    let filtered = this.assignments;
    if (this.selectedClassroomId !== null) {
      filtered = this.assignments.filter(a => a.classroomId === this.selectedClassroomId);
    }

    // 2. Group into Assigned, Missing, Done
    this.assignedWork = [];
    this.missingWork = [];
    this.doneWork = [];

    filtered.forEach(assignment => {
      if (assignment.isSubmitted) {
        this.doneWork.push(assignment);
      } else {
        if (assignment.dueDate) {
          const due = new Date(assignment.dueDate).getTime();
          if (due < now) {
            this.missingWork.push(assignment);
          } else {
            this.assignedWork.push(assignment);
          }
        } else {
          // No due date = assigned
          this.assignedWork.push(assignment);
        }
      }
    });
  }
}
