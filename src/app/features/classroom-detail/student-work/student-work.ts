import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface StudentProfile {
  id: number;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface StudentWorkItem {
  assignmentId: number;
  title: string;
  dueDate?: string;
  maxPoints?: number;
  submissionId: number;
  grade?: number;
  state: string; // "Missing", "Turned in", "Graded", "Assigned"
}

export interface StudentWorkDto {
  profile: StudentProfile;
  workItems: StudentWorkItem[];
}

@Component({
  selector: 'app-student-work',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './student-work.html',
  styleUrls: ['./student-work.css']
})
export class StudentWork implements OnInit {
  classroomId!: number;
  studentWork?: StudentWorkDto;
  filteredItems: StudentWorkItem[] = [];
  selectedFilter: string = 'All';
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.parent?.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.classroomId = +id;
        this.loadStudentWork();
      }
    });
  }

  loadStudentWork() {
    this.isLoading = true;
    this.http.get<StudentWorkDto>(`${environment.apiUrl}/Classroom/${this.classroomId}/student-work`)
      .subscribe({
        next: (data) => {
          this.studentWork = data;
          this.applyFilter();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load student work', err);
          this.isLoading = false;
        }
      });
  }

  applyFilter() {
    if (!this.studentWork) return;

    if (this.selectedFilter === 'All') {
      this.filteredItems = [...this.studentWork.workItems];
    } else if (this.selectedFilter === 'Assigned') {
      this.filteredItems = this.studentWork.workItems.filter(i => i.state === 'Assigned' || i.state === 'Missing');
    } else if (this.selectedFilter === 'Returned') {
      this.filteredItems = this.studentWork.workItems.filter(i => i.state === 'Graded');
    } else if (this.selectedFilter === 'Missing') {
      this.filteredItems = this.studentWork.workItems.filter(i => i.state === 'Missing');
    }
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.value;
    this.applyFilter();
  }
}
