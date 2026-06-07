import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Assignment {
  id?: number;
  classroomId: number;
  title: string;
  description?: string;
  attachmentUrl?: string;
  points?: number | null;
  dueDate?: Date;
  topic?: string;
  createdAt?: string;
  teacherId?: number;
  teacherName?: string;
  isSubmitted?: boolean;
  submittedAt?: string;
  classroomName?: string;
  turnedInCount?: number;
  assignedCount?: number;
  comments?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createAssignment(classroomId: number, data: any): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.apiUrl}/classrooms/${classroomId}/assignments`, data);
  }

  getAssignments(classroomId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/classrooms/${classroomId}/assignments`);
  }

  getUserAssignments(): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.apiUrl}/users/me/assignments`);
  }

  updateAssignment(classroomId: number, assignmentId: number, data: any): Observable<Assignment> {
    return this.http.put<Assignment>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}`, data);
  }

  deleteAssignment(classroomId: number, assignmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}`);
  }

  submitAssignment(classroomId: number, assignmentId: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}/submit`, data);
  }

  getAssignmentSubmissions(classroomId: number, assignmentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}/submissions?t=${new Date().getTime()}`);
  }

  addAssignmentComment(classroomId: number, assignmentId: number, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}/comments`, { comment });
  }

  addSubmissionComment(classroomId: number, submissionId: number, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classrooms/${classroomId}/assignments/submissions/${submissionId}/comments`, { comment });
  }

  unsubmitAssignment(classroomId: number, assignmentId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}/submit`);
  }

  gradeSubmission(classroomId: number, assignmentId: number, submissionId: number, gradeData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}/submissions/${submissionId}/grade`, gradeData);
  }

  gradeStudent(classroomId: number, assignmentId: number, studentId: number, gradeData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classrooms/${classroomId}/assignments/${assignmentId}/students/${studentId}/grade`, gradeData);
  }

  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    // The backend endpoint is POST /api/FileUpload
    return this.http.post<{ url: string }>(`${this.apiUrl}/FileUpload`, formData);
  }
}
