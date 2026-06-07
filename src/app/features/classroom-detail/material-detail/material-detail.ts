import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialService } from '../../../core/services/material.service';
import { ClassroomService, Classroom } from '../../../core/services/classroom.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-material-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  templateUrl: './material-detail.html',
  styleUrls: ['./material-detail.css']
})
export class MaterialDetail implements OnInit {
  classroomId: number = 0;
  materialId: number = 0;
  material: any = null;
  classroom: Classroom | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentUserInitial: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private materialService: MaterialService,
    private classroomService: ClassroomService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const username = this.authService.getUsername();
    if (username) {
      this.currentUserInitial = username.charAt(0).toUpperCase();
    }

    this.route.parent?.paramMap.subscribe(params => {
      const cId = params.get('id');
      if (cId) {
        this.classroomId = +cId;
        this.loadClassroom();
      }
    });

    this.route.paramMap.subscribe(params => {
      const mId = params.get('materialId');
      if (mId) {
        this.materialId = +mId;
        if (this.classroomId > 0) {
          this.loadMaterial();
        }
      }
    });
  }

  loadClassroom(): void {
    this.classroomService.getClassroomDetails(this.classroomId).subscribe({
      next: (data: any) => {
        this.classroom = data;
        if (this.materialId > 0 && !this.material) {
          this.loadMaterial();
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  loadMaterial(): void {
    this.loading = true;
    this.materialService.getMaterial(this.classroomId, this.materialId).subscribe({
      next: (data: any) => {
        this.material = data;
        if (this.material.attachmentUrl) {
          try {
            this.material.parsedAttachments = JSON.parse(this.material.attachmentUrl);
          } catch (e) {
            this.material.parsedAttachments = [];
          }
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load material';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getBackground(id: number): string {
    const colors = ['#e91e63', '#1976d2', '#00897b', '#ef6c00', '#8e24aa'];
    return colors[id % colors.length] || '#1976d2';
  }

  goBack(): void {
    this.router.navigate(['/classroom', this.classroomId, 'classwork']);
  }

  newComment: string = '';

  sendComment(): void {
    if (!this.newComment.trim() || !this.material) return;
    const commentText = this.newComment;
    this.newComment = '';
    
    this.materialService.addMaterialComment(this.classroomId, this.materialId, commentText).subscribe({
      next: (comment) => {
        if (!this.material.comments) {
          this.material.comments = [];
        }
        this.material.comments.push(comment);
      },
      error: (err) => {
        console.error('Error adding comment', err);
        this.newComment = commentText;
        alert('Failed to add comment');
      }
    });
  }
}
