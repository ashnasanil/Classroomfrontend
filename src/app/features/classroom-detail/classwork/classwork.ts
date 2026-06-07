import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { MaterialService } from '../../../core/services/material.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-classwork',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule
  ],
  templateUrl: './classwork.html',
  styleUrls: ['./classwork.css']
})
export class Classwork implements OnInit {
  role: string | null = '';
  classroomId: number = 0;
  classroom: any = null;
  assignmentsByTopic: { topic: string, assignments: any[] }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classroomService: ClassroomService,
    private assignmentService: AssignmentService,
    private materialService: MaterialService,
    private authService: AuthService
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
      },
      error: (err: any) => console.error(err)
    });

    this.loadAssignments();
  }

  loadAssignments(): void {
    forkJoin({
      assignments: this.assignmentService.getAssignments(this.classroomId),
      materials: this.materialService.getMaterials(this.classroomId)
    }).subscribe({
      next: ({ assignments, materials }) => {
        const grouped = new Map<string, any[]>();
        
        const allItems = [
          ...assignments.map(a => ({ ...a, type: 'assignment' })),
          ...materials.map(m => ({ ...m, type: 'material' }))
        ];
        
        allItems.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        allItems.forEach(item => {
          const topic = item.topic || 'No topic';
          if (!grouped.has(topic)) {
            grouped.set(topic, []);
          }
          grouped.get(topic)!.push(item);
        });

        this.assignmentsByTopic = Array.from(grouped.entries()).map(([topic, items]) => ({
          topic,
          assignments: items
        }));
      },
      error: (err) => console.error(err)
    });
  }

  editAssignment(assignmentId: number): void {
    this.router.navigate(['/classroom', this.classroomId, 'create'], { queryParams: { edit: assignmentId } });
  }

  deleteAssignment(assignmentId: number): void {
    if (confirm('Are you sure you want to delete this assignment?')) {
      this.assignmentService.deleteAssignment(this.classroomId, assignmentId).subscribe({
        next: () => {
          this.loadAssignments(); // Reload after delete
        },
        error: (err) => console.error('Failed to delete assignment', err)
      });
    }
  }

  copyLink(assignmentId: number): void {
    const url = `${window.location.origin}/classroom/${this.classroomId}/assignment/${assignmentId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard');
    });
  }
}
