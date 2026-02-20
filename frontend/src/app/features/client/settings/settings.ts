import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.html',
  styleUrl: './settings.scss'
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  userForm: FormGroup;
  currentUser: User | null = null;
  loading = false;
  
  // To toggle password visibility
  hidePassword = true;

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }, [Validators.email]],
      phone: [''],
      password: ['', [Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        });
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid || !this.currentUser) return;

    this.loading = true;
    
    // Construct the payload to update
    const formValue = this.userForm.value;
    const payload: Partial<User> & { password?: string } = {
      name: formValue.name,
      phone: formValue.phone || null
    };

    if (formValue.password) {
      payload.password = formValue.password;
    }

    this.authService.updateUser(this.currentUser.id, payload).subscribe({
      next: () => {
        this.loading = false;
        this.userForm.get('password')?.reset();
        this.snackBar.open('Perfil atualizado com sucesso!', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Erro ao atualizar o perfil. Tente novamente.', 'Fechar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
