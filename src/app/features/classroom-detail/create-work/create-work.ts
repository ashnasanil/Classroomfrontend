import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { AssignmentService } from '../../../core/services/assignment.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-url-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%; margin-top: 8px;">
        <mat-label>URL</mat-label>
        <input matInput [(ngModel)]="url" placeholder="https://...">
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [mat-dialog-close]="url" [disabled]="!url">Add</button>
    </mat-dialog-actions>
  `
})
export class UrlDialog {
  url: string = '';
  constructor(
    public dialogRef: MatDialogRef<UrlDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}
}

@Component({
  selector: 'app-create-work',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './create-work.html',
  styleUrls: ['./create-work.css']
})
export class CreateWork implements OnInit {
  classroomId: number = 0;
  
  // Form State
  title: string = '';
  instructions: string = '';
  points: string = '100';
  dueDate: Date | null = null;
  topic: string = 'No topic';

  attachedFiles: any[] = [];
  isQuiz: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private assignmentService: AssignmentService,
    private classroomService: ClassroomService,
    private dialog: MatDialog
  ) {}

  @ViewChild('editor') editor!: ElementRef;

  editAssignmentId: number | null = null;

  ngOnInit(): void {
    // Determine if it's a quiz based on query params or route
    this.route.queryParams.subscribe(params => {
      if (params['type'] === 'quiz') {
        this.isQuiz = true;
      }
      if (params['edit']) {
        this.editAssignmentId = +params['edit'];
      }
    });

    this.route.parent?.paramMap.subscribe((params: any) => {
      const id = params.get('id');
      if (id) {
        this.classroomId = +id;
        if (this.editAssignmentId) {
          this.loadAssignmentDetails();
        }
      }
    });
  }

  loadAssignmentDetails(): void {
    this.assignmentService.getAssignments(this.classroomId).subscribe({
      next: (assignments) => {
        const assignment = assignments.find(a => a.id === this.editAssignmentId);
        if (assignment) {
          this.title = assignment.title;
          this.instructions = assignment.description || '';
          if (this.editor && this.editor.nativeElement) {
            this.editor.nativeElement.innerHTML = this.instructions;
          }
          this.points = assignment.points === null ? 'ungraded' : (assignment.points?.toString() || '100');
          this.dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
          this.topic = assignment.topic || '';
          
          if (assignment.attachmentUrl) {
            try {
              this.attachedFiles = JSON.parse(assignment.attachmentUrl);
            } catch {
              this.attachedFiles = [];
            }
          }
        }
      },
      error: (err) => console.error('Error loading assignment for edit', err)
    });
  }

  removeQuiz(): void {
    this.isQuiz = false;
  }

  execCommand(command: string): void {
    document.execCommand(command, false, '');
    if (this.editor && this.editor.nativeElement) {
      this.editor.nativeElement.focus();
    }
  }

  async onFileSelected(event: any): Promise<void> {
    if (event.target.files && event.target.files.length > 0) {
      for (let i = 0; i < event.target.files.length; i++) {
        const file = event.target.files[i];
        try {
          const res = await this.classroomService.uploadFile(file).toPromise();
          if (res && res.url) {
            this.attachedFiles.push({ type: 'file', name: file.name, url: res.url });
          }
        } catch (e) {
          console.error('Failed to upload file', e);
        }
      }
    }
  }

  addLink(): void {
    const dialogRef = this.dialog.open(UrlDialog, { width: '400px', data: { title: 'Add link' } });
    dialogRef.afterClosed().subscribe(url => {
      if (url) {
        this.attachedFiles.push({ type: 'link', name: url, url: url });
      }
    });
  }

  addYouTube(): void {
    const dialogRef = this.dialog.open(UrlDialog, { width: '400px', data: { title: 'Add YouTube video' } });
    dialogRef.afterClosed().subscribe(url => {
      if (url) {
        this.attachedFiles.push({ type: 'youtube', name: 'YouTube Video', url: url });
      }
    });
  }

  addDriveFile(): void {
    const dialogRef = this.dialog.open(UrlDialog, { width: '400px', data: { title: 'Add Google Drive link' } });
    dialogRef.afterClosed().subscribe(url => {
      if (url) {
        this.attachedFiles.push({ type: 'drive', name: url, url: url, icon: 'description' });
      }
    });
  }

  createDoc(type: string): void {
    let docName = 'Untitled ' + type;
    let icon = 'description';
    if (type === 'Forms') { docName = 'Blank Quiz'; icon = 'receipt'; }
    if (type === 'Slides') { icon = 'slideshow'; }
    if (type === 'Sheets') { icon = 'table_chart'; }
    
    this.attachedFiles.push({ type: 'drive', name: docName, icon: icon });
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  close(): void {
    this.router.navigate(['/classroom', this.classroomId, 'classwork']);
  }

  assign(): void {
    const finalInstructions = this.editor?.nativeElement?.innerHTML || this.instructions;
    const payload = {
      title: this.title,
      description: finalInstructions,
      points: this.points === 'ungraded' ? 0 : 100,
      dueDate: this.dueDate ? this.dueDate.toISOString() : null,
      topic: this.topic === 'No topic' ? null : this.topic,
      attachmentUrl: this.attachedFiles.length > 0 ? JSON.stringify(this.attachedFiles) : null
    };

    if (this.editAssignmentId) {
      this.assignmentService.updateAssignment(this.classroomId, this.editAssignmentId, payload).subscribe({
        next: (res: any) => {
          console.log('Assignment updated successfully!', res);
          this.close();
        },
        error: (err: any) => {
          console.error('Error updating assignment', err);
          alert('Failed to update assignment. Make sure the backend is running!');
        }
      });
    } else {
      this.assignmentService.createAssignment(this.classroomId, payload).subscribe({
        next: (res: any) => {
          console.log('Assignment created successfully!', res);
          this.close();
        },
        error: (err: any) => {
          console.error('Error creating assignment', err);
          alert('Failed to create assignment. Make sure the backend is running!');
        }
      });
    }
  }
}
