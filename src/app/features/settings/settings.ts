import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatSlideToggleModule, MatIconModule, MatButtonModule, FormsModule, MatDialogModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css']
})
export class Settings implements OnInit {
  settings: UserSettings | null = null;
  username: string = '';

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.username = this.authService.getUsername() || '';
    this.settingsService.getSettings().subscribe({
      next: (data) => {
        this.settings = data;
      },
      error: (err) => {
        console.error('Failed to load settings', err);
      }
    });
  }

  onToggleChange() {
    if (this.settings) {
      this.settingsService.updateSettings(this.settings).subscribe({
        next: (updatedSettings) => {
          this.settings = updatedSettings;
        },
        error: (err) => {
          console.error('Failed to update settings', err);
        }
      });
    }
  }

  openProfilePictureDialog(event: Event) {
    event.preventDefault();
    this.dialog.open(ProfilePictureDialogComponent, {
      width: '450px',
      panelClass: 'profile-picture-dialog'
    });
  }
}

@Component({
  selector: 'app-profile-picture-dialog',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
  template: `
    <div class="dialog-header">
      <div class="header-left">
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
        <span class="dialog-title">Add profile picture</span>
      </div>
      <button mat-icon-button>
        <mat-icon>more_vert</mat-icon>
      </button>
    </div>
    
    <div class="dialog-content">
      <h3 class="section-title">Browse Illustrations</h3>
      <div class="illustrations-row">
        <div class="illustration-circle bg-peach">
          <mat-icon class="large-icon">video_camera_front</mat-icon>
        </div>
        <div class="illustration-circle bg-blue">
          <mat-icon class="large-icon">directions_car</mat-icon>
        </div>
        <div class="illustration-circle bg-red">
          <mat-icon class="large-icon">fitness_center</mat-icon>
        </div>
        <div class="illustration-circle bg-yellow">
          <mat-icon class="large-icon">local_florist</mat-icon>
        </div>
      </div>
      
      <div class="action-list">
        <button mat-button class="action-item">
          <mat-icon>palette</mat-icon>
          <span>See more illustrations</span>
        </button>
        <button mat-button class="action-item">
          <mat-icon>photo_library</mat-icon>
          <span>Upload from Device</span>
        </button>
        <button mat-button class="action-item">
          <mat-icon>photo_camera</mat-icon>
          <span>Take a picture</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .dialog-title {
      font-family: 'Google Sans', sans-serif;
      font-size: 20px;
      color: #1f1f1f;
    }
    .dialog-content {
      padding: 0;
    }
    .section-title {
      padding: 16px 24px 8px;
      font-family: 'Google Sans', sans-serif;
      font-size: 16px;
      font-weight: 500;
      margin: 0;
    }
    .illustrations-row {
      display: flex;
      gap: 16px;
      padding: 0 24px 16px;
      overflow-x: auto;
    }
    .illustration-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bg-peach { background-color: #ffdcb5; color: #d84b2e; }
    .bg-blue { background-color: #c4e4f5; color: #1a73e8; }
    .bg-red { background-color: #f28b82; color: #5f6368; }
    .bg-yellow { background-color: #fde293; color: #1e8e3e; }
    .large-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    .action-list {
      display: flex;
      flex-direction: column;
      border-top: 1px solid #e0e0e0;
      padding: 8px 0;
    }
    .action-item {
      display: flex;
      justify-content: flex-start;
      padding: 16px 24px;
      color: #3c4043;
      font-family: 'Google Sans', sans-serif;
      border-radius: 0;
    }
    ::ng-deep .action-item .mdc-button__label {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `]
})
export class ProfilePictureDialogComponent {}
