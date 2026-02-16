import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
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
    RouterModule
  ],
  template: `
    <div class="register-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Cadastro</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nome Completo</mat-label>
              <input matInput formControlName="name" placeholder="Seu nome">
              <mat-error *ngIf="registerForm.get('name')?.hasError('required')">Nome é obrigatório</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" placeholder="seu@email.com">
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">Email é obrigatório</mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">Email inválido</mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Senha</mat-label>
              <input matInput formControlName="password" type="password">
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">Senha é obrigatória</mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">Mínimo 6 caracteres</mat-error>
            </mat-form-field>

            <div class="type-selection">
              <label id="type-radio-group-label">Eu sou:</label>
              <mat-radio-group aria-labelledby="type-radio-group-label" formControlName="type" class="radio-group">
                <mat-radio-button [value]="UserType.CLIENT">Cliente (Busco Serviços)</mat-radio-button>
                <mat-radio-button [value]="UserType.PROFESSIONAL">Profissional (Ofereço Serviços)</mat-radio-button>
              </mat-radio-group>
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading" class="submit-btn">
              {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
            </button>

            <div class="login-link">
              Já tem uma conta? <a routerLink="/login">Faça Login</a>
            </div>

          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
      background-color: #f5f5f5;
    }
    mat-card {
      max-width: 400px;
      width: 100%;
      padding: 20px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 10px;
    }
    .type-selection {
      margin: 15px 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .submit-btn {
      width: 100%;
      margin-top: 20px;
    }
    .login-link {
      margin-top: 15px;
      text-align: center;
      font-size: 14px;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

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
        alert('Cadastro realizado com sucesso! Faça login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        const msg = err.error?.detail || 'Erro ao cadastrar';
        alert(msg);
      }
    });
  }
}
