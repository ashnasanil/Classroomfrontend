import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ClassroomService, Classroom } from '../../core/services/classroom.service';

@Component({
  selector: 'app-to-review',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule
  ],
  templateUrl: './to-review.html',
  styleUrls: ['./to-review.css']
})
export class ToReview implements OnInit {
  classrooms: Classroom[] = [];
  selectedClassroomId: number | string = 'all';

  constructor(private classroomService: ClassroomService) {}

  ngOnInit(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (data: any) => {
        this.classrooms = data;
      },
      error: (err: any) => console.error(err)
    });
  }
}
