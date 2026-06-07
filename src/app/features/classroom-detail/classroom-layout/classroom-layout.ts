import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService, Classroom } from '../../../core/services/classroom.service';
import { SettingsDialogComponent } from '../settings/settings-dialog';

@Component({
  selector: 'app-classroom-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule
  ],
  templateUrl: './classroom-layout.html',
  styleUrls: ['./classroom-layout.css']
})
export class ClassroomLayout implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  role: string | null = '';
  classroomId: number = 0;
  classroom: Classroom | null = null;
  username: string | null = '';
  
  links = [
    { label: 'Stream', path: 'stream' },
    { label: 'Classwork', path: 'classwork' },
    { label: 'People', path: 'people' }
  ];

  constructor(
    private authService: AuthService,
    private classroomService: ClassroomService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.route.paramMap.subscribe(params => {
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
        
        // Re-evaluate links based on new role
        this.links = [
          { label: 'Stream', path: 'stream' },
          { label: 'Classwork', path: 'classwork' },
          { label: 'People', path: 'people' }
        ];
        if (this.role === 'Teacher') {
          this.links.push({ label: 'Grades', path: 'grades' });
        }
      },
      error: (err: any) => {
        console.error('Failed to load classroom details', err);
      }
    });
  }

  openSettingsDialog(): void {
    if (!this.classroom) return;
    
    const dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      panelClass: 'full-screen-dialog',
      data: { classroomId: this.classroomId, classroom: this.classroom }
    });

    dialogRef.afterClosed().subscribe(updatedClassroom => {
      if (updatedClassroom) {
        this.classroom = updatedClassroom;
      }
    });
  }

  isAssignmentRoute(): boolean {
    return this.router.url.includes('/assignment');
  }

  isNoTabsRoute(): boolean {
    return this.router.url.includes('/assignment') || this.router.url.includes('/student-work');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onAppClick(appName: string): void {
    let url = 'https://www.google.com';
    switch (appName) {
      case 'Account': url = 'https://myaccount.google.com/'; break;
      case 'Drive': url = this.getDriveLink(); break;
      case 'Gmail': url = 'https://mail.google.com/'; break;
      case 'YouTube': url = 'https://www.youtube.com/'; break;
      case 'Gemini': url = 'https://gemini.google.com/'; break;
      case 'Maps': url = 'https://maps.google.com/'; break;
      case 'Search': url = 'https://www.google.com/'; break;
      case 'Calendar': url = this.getCalendarLink(); break;
      case 'News': url = 'https://news.google.com/'; break;
      case 'Photos': url = 'https://photos.google.com/'; break;
      case 'Meet': url = 'https://meet.google.com/'; break;
      case 'Translate': url = 'https://translate.google.com/'; break;
    }
    window.open(url, '_blank');
  }

  getCalendarLink(): string {
    // We cannot use /b/username/ because if the mock username doesn't match an active Google session, Google returns 404.
    // Instead, just redirect to the default Calendar router which handles active sessions automatically.
    return 'https://calendar.google.com/calendar/r';
  }

  getDriveLink(): string {
    // Same as above, just return the default Google Drive URL.
    return 'https://drive.google.com/drive/my-drive';
  }
}
