import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClassroomService, Classroom } from '../../../core/services/classroom.service';
import { AssignmentService } from '../../../core/services/assignment.service';
import { MaterialService } from '../../../core/services/material.service';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { ClassCodeDialog } from '../class-code-dialog/class-code-dialog';
import { AnnouncementDialog } from '../announcement-dialog/announcement-dialog';
import { RepostDialog } from '../repost-dialog/repost-dialog';
import { CustomizeDialog } from '../customize-dialog/customize-dialog';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-stream',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatFormFieldModule,
    MatDialogModule,
    MatDividerModule,
    FormsModule
  ],
  templateUrl: './stream.html',
  styleUrls: ['./stream.css']
})
export class Stream implements OnInit {
  classroomId: number = 0;
  classroom: Classroom | null = null;
  role: string | null = '';
  showClassInfo: boolean = false;
  
  announcements: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classroomService: ClassroomService,
    private assignmentService: AssignmentService,
    private materialService: MaterialService,
    private authService: AuthService,
    private dialog: MatDialog
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
    
    this.loadAnnouncements();
  }

  openAnnouncementDialog(): void {
    const dialogRef = this.dialog.open(AnnouncementDialog, {
      width: '600px',
      data: { className: this.classroom?.className }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.postAnnouncement(result.content, result.attachments);
      }
    });
  }

  openRepostDialog(): void {
    const dialogRef = this.dialog.open(RepostDialog, {
      width: '600px',
      panelClass: 'custom-dialog-container',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Selected class to repost from:', result);
      }
    });
  }

  loadAnnouncements(): void {
    forkJoin({
      announcements: this.classroomService.getAnnouncements(this.classroomId),
      assignments: this.assignmentService.getAssignments(this.classroomId),
      materials: this.materialService.getMaterials(this.classroomId)
    }).subscribe({
      next: ({ announcements, assignments, materials }) => {
        // Map announcements
        const parsedAnnouncements = announcements.map((post: any) => {
          post.type = 'announcement';
          if (post.attachmentUrl) {
            try { post.parsedAttachments = JSON.parse(post.attachmentUrl); }
            catch(e) { post.parsedAttachments = []; }
          } else { post.parsedAttachments = []; }
          return post;
        });

        // Map assignments
        const parsedAssignments = assignments.map((assign: any) => {
          assign.type = 'assignment';
          return assign;
        });

        // Map materials
        const parsedMaterials = materials.map((mat: any) => {
          mat.type = 'material';
          return mat;
        });

        // Merge and sort by createdAt descending
        this.announcements = [...parsedAnnouncements, ...parsedAssignments, ...parsedMaterials].sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
      },
      error: (err: any) => console.error(err)
    });
  }

  async postAnnouncement(content: string, attachments: any[]): Promise<void> {
    // Check if there are files to upload
    for (let att of attachments) {
      if (att.type === 'upload' && att.file) {
        try {
          const res = await this.classroomService.uploadFile(att.file).toPromise();
          if (res && res.url) {
            const baseUrl = environment.apiUrl.replace('/api', '');
            att.url = `${baseUrl}${res.url}`; 
          }
          // Remove the file object so it doesn't get serialized into JSON
          delete att.file;
        } catch (e) {
          console.error("Failed to upload file", e);
        }
      }
    }

    const payload = {
      content: content,
      attachmentUrl: attachments.length > 0 ? JSON.stringify(attachments) : null
    };

    this.classroomService.createAnnouncement(this.classroomId, payload).subscribe({
      next: (post: any) => {
        if (post.attachmentUrl) {
            try {
              post.parsedAttachments = JSON.parse(post.attachmentUrl);
            } catch(e) {
              post.parsedAttachments = [];
            }
        }
        // Optimistically add to the top
        this.announcements.unshift(post);
      },
      error: (err: any) => {
        console.error('Error posting announcement:', err);
        this.loadAnnouncements();
      }
    });
  }

  addComment(post: any): void {
    if (!post.newComment || !post.newComment.trim()) return;
    
    const content = post.newComment.trim();
    
    this.classroomService.addComment(post.id, content).subscribe({
      next: (comment: any) => {
        if (!post.comments) {
          post.comments = [];
        }
        post.comments.push(comment);
        post.newComment = '';
        post.commentFocused = false;
      },
      error: (err: any) => console.error('Error adding comment', err)
    });
  }

  getBackground(id: number): string {
    if (id === this.classroomId) {
      const stored = localStorage.getItem(`classroom_theme_${this.classroomId}`);
      if (stored) return stored;
    }
    const colors = ['#e91e63', '#1976d2', '#00897b', '#ef6c00', '#8e24aa'];
    return colors[id % colors.length];
  }

  openCustomizeDialog(): void {
    const dialogRef = this.dialog.open(CustomizeDialog, {
      width: '600px',
      data: { currentColor: this.getBackground(this.classroomId) },
      panelClass: 'customize-dialog-container',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.themeColor) {
        localStorage.setItem(`classroom_theme_${this.classroomId}`, result.themeColor);
      }
    });
  }

  openClassCodeDialog(): void {
    if (this.classroom) {
      this.dialog.open(ClassCodeDialog, {
        data: { classroom: this.classroom },
        panelClass: 'custom-dialog-container',
        autoFocus: false
      });
    }
  }

  navigateToReview(): void {
    if (this.role === 'Teacher') {
      this.router.navigate(['/to-review']);
    } else {
      this.router.navigate(['/to-do']);
    }
  }

  editAssignment(assignmentId: number): void {
    this.router.navigate(['/classroom', this.classroomId, 'create'], { queryParams: { edit: assignmentId } });
  }

  deleteAssignment(assignmentId: number): void {
    if (confirm('Are you sure you want to delete this assignment?')) {
      this.assignmentService.deleteAssignment(this.classroomId, assignmentId).subscribe({
        next: () => {
          this.loadAnnouncements(); // Reload after delete
        },
        error: (err) => console.error('Failed to delete assignment', err)
      });
    }
  }

  copyAssignmentLink(assignmentId: number): void {
    const url = `${window.location.origin}/classroom/${this.classroomId}/assignment/${assignmentId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard');
    });
  }
}

