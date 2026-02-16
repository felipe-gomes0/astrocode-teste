import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { email, password } = this.loginForm.value;

      this.authService.login({ email, password }).subscribe({
        next: () => {
          this.isLoading = false;
          // Navigate to dashboard or home based on user type?
          // For now let's go to home or user specific page
          // Router navigate handled in component or service?
          // Service login documentation says it fetches user.
          // Let's redirect to /professional/dashboard or /client/search based on type
          // OR just let the component decide.
          // For now just alert or simple navigate.
          this.authService.currentUser.subscribe(user => {
              if (user?.type === 'professional') {
                  this.router.navigate(['/professional/dashboard']);
              } else {
                  this.router.navigate(['/client/search']);
              }
          });
        },
        error: (err: any) => {
          this.isLoading = false;
          this.errorMessage = 'Senha ou email inválidos';
        }
      });
    }
  }
}
