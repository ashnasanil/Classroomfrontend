import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ClassroomService, Classroom } from '../../../core/services/classroom.service';

@Component({
  selector: 'app-repost-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './repost-dialog.html',
  styleUrls: ['./repost-dialog.css']
})
export class RepostDialog implements OnInit {
  classes: Classroom[] = [];

  constructor(
    public dialogRef: MatDialogRef<RepostDialog>,
    private classroomService: ClassroomService
  ) {}

  ngOnInit(): void {
    this.classroomService.getClassrooms().subscribe({
      next: (data: Classroom[]) => {
        this.classes = data;
      },
      error: (err: any) => console.error(err)
    });
  }

  getBackground(id: number): string {
    const colors = ['#e91e63', '#1976d2', '#00897b', '#ef6c00', '#8e24aa'];
    return colors[id % colors.length];
  }

  selectClass(classroom: Classroom): void {
    this.dialogRef.close(classroom);
  }
}
