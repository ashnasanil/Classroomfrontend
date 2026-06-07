import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../core/services/user.service';

export interface InviteDialogData {
  type: 'students' | 'teachers';
  classCode?: string;
}

@Component({
  selector: 'app-invite-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    FormsModule
  ],
  template: `
    <div class="invite-dialog-container">
      <div class="dialog-header">
        <h2>Invite {{ data.type }}</h2>
      </div>

      <div class="dialog-content">
        <div class="invite-link-section" *ngIf="data.type === 'students'">
          <div class="link-label">Invite link</div>
          <div class="link-row">
            <span class="link-url">https://classroom.google.com/c/ODY3MTkxNTk4OTMy?cjc={{ data.classCode || 'abcdef' }}</span>
            <button mat-icon-button (click)="copyLink()" class="copy-btn">
              <mat-icon>content_copy</mat-icon>
            </button>
          </div>
          <mat-divider></mat-divider>
        </div>

        <div class="search-input-section">
          <input type="text" placeholder="Type a name or email" [(ngModel)]="searchQuery" class="search-input">
        </div>

        <div class="users-list-section">
          <div class="user-item" *ngFor="let user of filteredUsers" (click)="selectUser(user)" [class.selected]="selectedUser?.email === user.email">
            <div class="user-avatar" [ngStyle]="{'background-color': user.color}">{{ user.name.charAt(0).toUpperCase() }}</div>
            <div class="user-details">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">Cancel</button>
        <button mat-button color="primary" [disabled]="!searchQuery" class="invite-action-btn" (click)="onInvite()">Invite</button>
      </div>
    </div>
  `,
  styles: [`
    .invite-dialog-container {
      width: 500px;
      max-width: 90vw;
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .dialog-header {
      padding: 24px 24px 16px 24px;
    }
    
    .dialog-header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #3c4043;
      font-family: 'Google Sans', Arial, sans-serif;
    }
    
    .dialog-content {
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    
    .invite-link-section {
      padding: 0 24px;
      margin-bottom: 8px;
    }
    
    .link-label {
      font-size: 14px;
      font-weight: 500;
      color: #3c4043;
      margin-bottom: 4px;
    }
    
    .link-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }
    
    .link-url {
      font-size: 12px;
      color: #5f6368;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-right: 16px;
    }
    
    .copy-btn {
      color: #5f6368;
      transform: scale(0.85);
    }
    
    .search-input-section {
      padding: 0 24px;
    }
    
    .search-input {
      width: 100%;
      border: none;
      outline: none;
      font-size: 16px;
      color: #3c4043;
      padding: 12px 0;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    
    .search-input:focus {
      border-bottom: 2px solid #1a73e8;
    }
    
    .users-list-section {
      max-height: 250px;
      overflow-y: auto;
      padding: 8px 0;
    }
    
    /* Scrollbar styling for the list */
    .users-list-section::-webkit-scrollbar {
      width: 8px;
    }
    .users-list-section::-webkit-scrollbar-track {
      background: transparent;
    }
    .users-list-section::-webkit-scrollbar-thumb {
      background: #dadce0;
      border-radius: 4px;
    }
    
    .user-item {
      display: flex;
      align-items: center;
      padding: 8px 24px;
      cursor: pointer;
    }
    
    .user-item:hover {
      background-color: #f8f9fa;
    }
    
    .user-item.selected {
      background-color: #e8f0fe;
    }
    
    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 500;
      margin-right: 16px;
    }
    
    .user-details {
      display: flex;
      flex-direction: column;
    }
    
    .user-name {
      font-size: 14px;
      color: #3c4043;
      line-height: 20px;
    }
    
    .user-email {
      font-size: 12px;
      color: #5f6368;
      line-height: 16px;
    }
    
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px 24px;
      gap: 8px;
    }
    
    .cancel-btn {
      color: #1a73e8;
      font-weight: 500;
    }
    
    .invite-action-btn {
      font-weight: 500;
    }
  `]
})
export class InviteDialogComponent implements OnInit {
  searchQuery: string = '';
  
  users: User[] = [];

  selectedUser: User | null = null;
  
  // Colors for generic avatars
  colors = ['#1a73e8', '#d93025', '#673ab7', '#188038', '#0097a7', '#f29900', '#e91e63'];

  constructor(
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InviteDialogData,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        // Assign a random color to each user for their avatar
        this.users = data.map((u, i) => ({
          ...u,
          color: this.colors[i % this.colors.length]
        }));
      },
      error: (err) => console.error(err)
    });
  }

  get filteredUsers() {
    if (!this.searchQuery) return this.users;
    const lowerQuery = this.searchQuery.toLowerCase();
    return this.users.filter(u => 
      u.name.toLowerCase().includes(lowerQuery) || 
      u.email.toLowerCase().includes(lowerQuery)
    );
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    this.searchQuery = user.email;
  }

  onInvite(): void {
    if (this.selectedUser || this.searchQuery) {
      const email = this.selectedUser?.email || this.searchQuery;
      const role = this.data.type === 'students' ? 'Student' : 'Teacher';
      this.dialogRef.close({ email, role });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  copyLink(): void {
    const link = 'https://classroom.google.com/c/ODY3MTkxNTk4OTMy?cjc=' + (this.data.classCode || 'abcdef');
    navigator.clipboard.writeText(link).then(() => {
      console.log('Link copied');
    });
  }
}
