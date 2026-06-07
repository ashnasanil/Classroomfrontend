import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AssignmentService, Assignment } from '../../core/services/assignment.service';
import { ClassroomService, Classroom } from '../../core/services/classroom.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule, 
    MatSelectModule, 
    MatButtonModule, 
    MatIconModule, 
    FormsModule,
    RouterModule
  ],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  classes: Classroom[] = [];
  selectedClassId: number | string = 'All classes';
  
  currentWeekStart: Date = new Date();
  daysOfWeek: { date: Date, name: string, number: number, isToday: boolean }[] = [];
  
  allAssignments: Assignment[] = [];
  filteredAssignments: Assignment[] = [];

  constructor(
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService
  ) {
    this.initCurrentWeek();
  }

  ngOnInit(): void {
    this.loadClasses();
    this.loadAssignments();
  }

  initCurrentWeek(): void {
    const today = new Date();
    // Get Sunday of the current week
    const day = today.getDay();
    const diff = today.getDate() - day;
    this.currentWeekStart = new Date(today.setDate(diff));
    this.currentWeekStart.setHours(0, 0, 0, 0);
    this.generateDaysOfWeek();
  }

  generateDaysOfWeek(): void {
    this.daysOfWeek = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      
      this.daysOfWeek.push({
        date: d,
        name: dayNames[i],
        number: d.getDate(),
        isToday: d.getTime() === today.getTime()
      });
    }
  }

  getWeekRangeText(): string {
    if (this.daysOfWeek.length === 0) return '';
    const start = this.daysOfWeek[0].date;
    const end = this.daysOfWeek[6].date;
    
    const startMonth = start.toLocaleString('default', { month: 'short' });
    const endMonth = end.toLocaleString('default', { month: 'short' });
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else if (start.getFullYear() === end.getFullYear()) {
      return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${startMonth} ${start.getDate()}, ${start.getFullYear()} - ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
    }
  }

  nextWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
    this.generateDaysOfWeek();
  }

  previousWeek(): void {
    this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
    this.generateDaysOfWeek();
  }

  loadClasses(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (classes: Classroom[]) => {
        this.classes = classes;
      }
    });
  }

  loadAssignments(): void {
    this.assignmentService.getUserAssignments().subscribe({
      next: (assignments) => {
        this.allAssignments = assignments.filter(a => a.dueDate); // Only assignments with due dates
        this.filterAssignments();
      },
      error: (err) => console.error('Error fetching assignments for calendar:', err)
    });
  }

  onClassChange(): void {
    this.filterAssignments();
  }

  filterAssignments(): void {
    if (this.selectedClassId === 'All classes') {
      this.filteredAssignments = this.allAssignments;
    } else {
      this.filteredAssignments = this.allAssignments.filter(a => a.classroomId === this.selectedClassId);
    }
  }

  getAssignmentsForDay(date: Date): Assignment[] {
    const targetTime = date.getTime();
    return this.filteredAssignments.filter(a => {
      if (!a.dueDate) return false;
      const dueDate = new Date(a.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate.getTime() === targetTime;
    });
  }

  getBackground(classroomId: number): string {
    const colors = ['#1967d2', '#1e8e3e', '#d93025', '#e37400', '#681da8', '#007b83', '#c26401'];
    return colors[classroomId % colors.length];
  }
}
