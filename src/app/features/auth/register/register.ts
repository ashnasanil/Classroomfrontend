import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  currentStep = 1;
  maxStep = 10;
  
  // To handle the simulated QR code synchronization step
  syncComplete = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: [''],
      birthday: [''],
      gender: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      recoveryEmail: [''],
      verificationEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      otp: [''],
      agreeTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  nextStep() {
    this.errorMessage = '';
    if (this.currentStep === 1) {
      if (this.registerForm.get('firstName')?.invalid) {
        this.registerForm.get('firstName')?.markAsTouched();
        return;
      }
    } else if (this.currentStep === 3) {
      if (this.registerForm.get('email')?.invalid) {
        this.registerForm.get('email')?.markAsTouched();
        return;
      }
    } else if (this.currentStep === 4) {
      if (this.registerForm.get('password')?.invalid || this.registerForm.hasError('mismatch')) {
        this.registerForm.get('password')?.markAsTouched();
        this.registerForm.get('confirmPassword')?.markAsTouched();
        return;
      }
    } else if (this.currentStep === 6) {
      if (this.registerForm.get('verificationEmail')?.invalid) {
        this.registerForm.get('verificationEmail')?.markAsTouched();
        return;
      }
      const verifyEmail = this.registerForm.get('verificationEmail')?.value;
      this.isLoading = false;
      this.currentStep++; // Instantly show Step 7 to the user

      // Fire and forget the OTP sending in the background
      this.authService.sendOtp(verifyEmail).subscribe({
        next: () => {},
        error: (err) => {
          console.error("Failed to send verification code", err);
        }
      });
      return;
    } else if (this.currentStep === 7) {
      const verifyEmail = this.registerForm.get('verificationEmail')?.value;
      const otp = this.registerForm.get('otp')?.value;
      if (!otp) {
        this.errorMessage = "Please enter the verification code.";
        return;
      }
      this.isLoading = true;
      this.authService.verifyOtp(verifyEmail, otp).subscribe({
        next: () => {
          this.isLoading = false;
          this.currentStep++;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid verification code.';
        }
      });
      return;
    } else if (this.currentStep === 9) {
      if (this.registerForm.get('agreeTerms')?.invalid) {
        this.errorMessage = "You must agree to the Terms of Service.";
        return;
      }
    }
    
    if (this.currentStep < this.maxStep) {
      this.currentStep++;
    }

    if (this.currentStep === 10) {
      this.onSubmit();
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      console.error('Form is invalid', this.registerForm.errors);
      this.errorMessage = "Please fill in all required fields.";
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const userData = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      role: 'Student'
    };

    this.authService.register(userData).subscribe({
      next: () => {
        // Leave isLoading true to show success briefly before navigation
        setTimeout(() => {
          this.isLoading = false;
          this.authService.logout(); // Clear token to force sign in
          this.router.navigate(['/login']); 
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
        console.error(err);
      }
    });
  }
}
