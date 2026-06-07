import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserSettings {
  allowEmailNotifications: boolean;
  commentsOnYourPosts: boolean;
  commentsThatMentionYou: boolean;
  privateCommentsOnWork: boolean;
  workAndPostsFromTeachers: boolean;
  returnedWorkAndGrades: boolean;
  invitationsToJoinClasses: boolean;
  dueDateReminders: boolean;
  lateSubmissions: boolean;
  resubmissions: boolean;
  invitationsToCoteach: boolean;
  scheduledPostPublished: boolean;
  showDisplayNameOnHomepage: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/users/me/settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(this.apiUrl);
  }

  updateSettings(settings: UserSettings): Observable<UserSettings> {
    return this.http.put<UserSettings>(this.apiUrl, settings);
  }
}
