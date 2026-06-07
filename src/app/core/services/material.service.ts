import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Material {
  id?: number;
  classroomId: number;
  title: string;
  description?: string;
  topic?: string;
  comments?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class MaterialService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createMaterial(classroomId: number, data: any): Observable<Material> {
    return this.http.post<Material>(`${this.apiUrl}/classrooms/${classroomId}/materials`, data);
  }

  getMaterials(classroomId: number): Observable<Material[]> {
    return this.http.get<Material[]>(`${this.apiUrl}/classrooms/${classroomId}/materials`);
  }

  getMaterial(classroomId: number, materialId: number): Observable<Material> {
    return this.http.get<Material>(`${this.apiUrl}/classrooms/${classroomId}/materials/${materialId}`);
  }

  addMaterialComment(classroomId: number, materialId: number, comment: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classrooms/${classroomId}/materials/${materialId}/comments`, { comment });
  }
}
