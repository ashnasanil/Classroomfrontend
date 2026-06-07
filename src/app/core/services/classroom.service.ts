import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Classroom {
  id: number;
  className: string;
  section?: string;
  subject?: string;
  room?: string;
  classCode: string;
  teacherId: number;
  teacherName?: string;
}

export interface GradebookStudent {
  id: number;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface GradebookAssignment {
  id: number;
  title?: string;
  dueDate?: string;
  points?: number;
}

export interface GradebookSubmission {
  id: number;
  assignmentId: number;
  studentId: number;
  grade?: number;
  state?: string;
}

export interface Gradebook {
  students: GradebookStudent[];
  assignments: GradebookAssignment[];
  submissions: GradebookSubmission[];
}

@Injectable({
  providedIn: 'root'
})
export class ClassroomService {
  private apiUrl = `${environment.apiUrl}/Classroom`;

  constructor(private http: HttpClient) {}

  getClassrooms(isArchived: boolean = false): Observable<Classroom[]> {
    return this.http.get<Classroom[]>(`${this.apiUrl}?isArchived=${isArchived}`);
  }

  createClassroom(data: any): Observable<Classroom> {
    return this.http.post<Classroom>(this.apiUrl, data);
  }

  joinClassroom(classCode: string): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.apiUrl}/join`, { classCode });
  }

  getClassroomDetails(id: number): Observable<Classroom> {
    return this.http.get<Classroom>(`${this.apiUrl}/${id}`);
  }

  getGradebook(id: number): Observable<Gradebook> {
    return this.http.get<Gradebook>(`${this.apiUrl}/${id}/gradebook`);
  }

  updateClassroomSettings(id: number, data: any): Observable<Classroom> {
    return this.http.put<Classroom>(`${this.apiUrl}/${id}/settings`, data);
  }

  archiveClassroom(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/archive`, {});
  }

  restoreClassroom(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/restore`, {});
  }

  deleteClassroom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  copyClassroom(id: number): Observable<Classroom> {
    return this.http.post<Classroom>(`${this.apiUrl}/${id}/copy`, {});
  }

  inviteUser(classroomId: number, email: string, role: 'Student' | 'Teacher'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${classroomId}/invite`, { email, role });
  }

  getAnnouncements(classroomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/classrooms/${classroomId}/announcements`);
  }

  createAnnouncement(classroomId: number, data: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/classrooms/${classroomId}/announcements`, data);
  }

  addComment(announcementId: number, content: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/classrooms/0/announcements/${announcementId}/comments`, { content });
  }

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${environment.apiUrl}/FileUpload`, formData);
  }
}
