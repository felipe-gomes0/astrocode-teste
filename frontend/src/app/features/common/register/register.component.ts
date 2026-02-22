import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { UserType } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  loading = false;
  UserType = UserType; // Make enum available in template

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: [UserType.CLIENT, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;
    
    this.loading = true;
    const val = this.registerForm.value;

    const userData = {
      name: val.name,
      email: val.email,
      password: val.password,
      type: val.type,
      active: true // Backend default is True anyway
    };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('Cadastro realizado com sucesso! Faça login.', 'Fechar', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        // Usa setTimeout para evitar NG0100 caso o erro retorne imediatamente (em modo dev)
        setTimeout(() => {
          this.loading = false;
          console.error('Registration Error:', err);
          
          let msg = 'Erro ao cadastrar';
          if (err.error && err.error.detail) {
            if (Array.isArray(err.error.detail)) {
              // Extract the first validation error message
              const firstError = err.error.detail[0];
              msg = `${firstError.loc[firstError.loc.length - 1]}: ${firstError.msg}`;
            } else if (typeof err.error.detail === 'string') {
              msg = err.error.detail;
            }
          }
          this.snackBar.open(msg, 'Fechar', { duration: 5000 });
        });
      }
    });
  }
}
