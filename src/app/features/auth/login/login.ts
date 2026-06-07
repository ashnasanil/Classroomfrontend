import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    MatCheckboxModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  forgotEmailForm!: FormGroup;
  forgotNameForm!: FormGroup;
  
  isLoading = false;
  errorMessage = '';
  emailError = false;
  
  // 1 = Email, 2 = Password, 3 = Find Email, 4 = Find Name, 5 = No Account Found
  currentStep = 1; 
  hidePassword = true; 

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    this.forgotEmailForm = this.fb.group({
      recoveryEmail: ['', [Validators.required]]
    });

    this.forgotNameForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['']
    });
  }

  nextStep(): void {
    if (this.currentStep === 1) {
      const emailCtrl = this.loginForm.get('email');
      if (emailCtrl?.invalid || !emailCtrl?.value) {
        this.emailError = true;
        emailCtrl?.markAsTouched();
        return;
      }
      this.emailError = false;
      this.currentStep = 2;
      this.loginForm.get('password')?.setValidators([Validators.required]);
      this.loginForm.get('password')?.updateValueAndValidity();
    } else if (this.currentStep === 3) {
      if (this.forgotEmailForm.invalid || !this.forgotEmailForm.value.recoveryEmail) {
        this.forgotEmailForm.markAllAsTouched();
        return;
      }
      this.currentStep = 4;
    } else if (this.currentStep === 4) {
      if (this.forgotNameForm.invalid || !this.forgotNameForm.value.firstName) {
        this.forgotNameForm.markAllAsTouched();
        return;
      }
      // Simulate backend check returning "No account found"
      this.currentStep = 5;
    }
  }

  prevStep() {
    if (this.currentStep === 2) {
      this.currentStep = 1;
      this.errorMessage = '';
    } else if (this.currentStep === 4) {
      this.currentStep = 3;
    } else if (this.currentStep === 5) {
      this.currentStep = 3;
      this.forgotEmailForm.reset();
      this.forgotNameForm.reset();
    }
  }

  goToForgotEmail() {
    this.currentStep = 3;
    this.forgotEmailForm.reset();
    this.forgotNameForm.reset();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password.';
        console.error(err);
      }
    });
  }
}
