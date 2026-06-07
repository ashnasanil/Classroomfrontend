import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },
  { path: 'blocked', loadComponent: () => import('./features/blocked/blocked.component').then(m => m.BlockedComponent) },
  { 
    path: '', 
    loadComponent: () => import('./features/layout/main-layout/main-layout').then(m => m.MainLayout),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'to-review', loadComponent: () => import('./features/to-review/to-review').then(m => m.ToReview) },
      { path: 'to-do', loadComponent: () => import('./features/to-do/to-do').then(m => m.ToDo) },
      { path: 'calendar', loadComponent: () => import('./features/calendar/calendar').then(m => m.Calendar) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings').then(m => m.Settings) },
      { path: 'archived-classes', loadComponent: () => import('./features/archived-classes/archived-classes').then(m => m.ArchivedClasses) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'classrooms/:classroomId/assignments/:assignmentId/grade/:studentId',
    loadComponent: () => import('./features/classroom-detail/grading-viewer/grading-viewer').then(m => m.GradingViewerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'classroom/:id',
    loadComponent: () => import('./features/classroom-detail/classroom-layout/classroom-layout').then(m => m.ClassroomLayout),
    canActivate: [authGuard],
    children: [
      { path: 'stream', loadComponent: () => import('./features/classroom-detail/stream/stream').then(m => m.Stream) },
      { path: 'classwork', loadComponent: () => import('./features/classroom-detail/classwork/classwork').then(m => m.Classwork) },
      { path: 'people', loadComponent: () => import('./features/classroom-detail/people/people').then(m => m.People) },
      { 
        path: 'grades', 
        loadComponent: () => import('./features/classroom-detail/grades/grades').then(m => m.Grades)
      },
      { 
        path: 'create', 
        loadComponent: () => import('./features/classroom-detail/create-work/create-work').then(m => m.CreateWork)
      },
      {
        path: 'assignment/:assignmentId',
        loadComponent: () => import('./features/classroom-detail/assignment-detail/assignment-detail').then(m => m.AssignmentDetail)
      },
      {
        path: 'student-work',
        loadComponent: () => import('./features/classroom-detail/student-work/student-work').then(m => m.StudentWork)
      },
      { 
        path: 'material/:materialId', 
        loadComponent: () => import('./features/classroom-detail/material-detail/material-detail').then(m => m.MaterialDetail) 
      },
      { path: '', redirectTo: 'stream', pathMatch: 'full' }
    ]
  },
  {
    path: 'form-builder/:id',
    loadComponent: () => import('./features/form-builder/form-builder').then(m => m.FormBuilder),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: 'dashboard' }
];
