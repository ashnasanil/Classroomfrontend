import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { ClassroomService } from '../../../core/services/classroom.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CreateClassDialog } from '../../classroom/create-class-dialog/create-class-dialog';
import { JoinClassDialog } from '../../classroom/join-class-dialog/join-class-dialog';
import { CreateClassWarningDialog } from '../../classroom/create-class-warning-dialog/create-class-warning-dialog';

@Component({
  selector: 'app-main-layout',
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
    MatDialogModule
  ],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.css']
})
export class MainLayout implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  username: string | null = '';
  pageTitle: string = '';
  isExpanded: boolean = true; // Set default to true for now so they can see it
  classrooms: any[] = [];
  taughtClasses: any[] = [];
  enrolledClasses: any[] = [];

  constructor(
    private authService: AuthService,
    private classroomService: ClassroomService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.urlAfterRedirects.includes('/to-review')) {
        this.pageTitle = 'To review';
      } else {
        this.pageTitle = '';
      }
    });
  }

  toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }

  ngOnInit(): void {
    this.username = this.authService.getUsername();
    this.classroomService.getClassrooms().subscribe({
      next: (data) => {
        this.classrooms = data;
        const currentUserId = this.authService.getUserId();
        this.taughtClasses = this.classrooms.filter(c => c.teacherId === currentUserId);
        this.enrolledClasses = this.classrooms.filter(c => c.teacherId !== currentUserId);
      },
      error: (err) => console.error('Failed to load classes for sidebar', err)
    });
  }

  getBackground(id: number): string {
    const colors = ['#e91e63', '#1976d2', '#00897b', '#ef6c00', '#8e24aa'];
    return colors[id % colors.length];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onAppClick(appName: string): void {
    let url = 'https://www.google.com';
    switch (appName) {
      case 'Account': url = 'https://myaccount.google.com/'; break;
      case 'Drive': url = 'https://drive.google.com/'; break;
      case 'Gmail': url = 'https://mail.google.com/'; break;
      case 'YouTube': url = 'https://www.youtube.com/'; break;
      case 'Gemini': url = 'https://gemini.google.com/'; break;
      case 'Maps': url = 'https://maps.google.com/'; break;
      case 'Search': url = 'https://www.google.com/'; break;
      case 'Calendar': url = 'https://calendar.google.com/'; break;
      case 'News': url = 'https://news.google.com/'; break;
      case 'Photos': url = 'https://photos.google.com/'; break;
      case 'Meet': url = 'https://meet.google.com/'; break;
      case 'Translate': url = 'https://translate.google.com/'; break;
    }
    window.open(url, '_blank');
  }

  openCreateClassDialog(): void {
    const warningDialogRef = this.dialog.open(CreateClassWarningDialog, {
      width: '500px',
      panelClass: 'warning-dialog-panel',
      disableClose: true // force them to click buttons
    });

    warningDialogRef.afterClosed().subscribe(agreed => {
      if (agreed) {
        const dialogRef = this.dialog.open(CreateClassDialog, {
          width: '500px'
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Reload dashboard to show the new class
            window.location.reload();
          }
        });
      }
    });
  }

  openJoinClassDialog(): void {
    const dialogRef = this.dialog.open(JoinClassDialog, {
      width: '600px',
      panelClass: 'join-class-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.location.reload();
      }
    });
  }
}
