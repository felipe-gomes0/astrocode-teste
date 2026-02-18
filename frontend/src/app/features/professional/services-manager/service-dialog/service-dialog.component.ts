import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Service } from '../../../../core/models/service.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ServiceManagementService } from '../../services/service-management.service';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './service-dialog.component.html',
  styleUrl: './service-dialog.component.scss'
})
export class ServiceDialogComponent {
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceManagementService);
  private authService = inject(AuthService); // Need auth to get professional ID for create
  private snackBar = inject(MatSnackBar);

  serviceForm: FormGroup;
  isEdit: boolean;
  loading = false;
  currentProfessionalId: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<ServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Service | null
  ) {
    this.isEdit = !!data;
    this.serviceForm = this.fb.group({
      name: [data?.name || '', Validators.required],
      description: [data?.description || ''],
      duration: [data?.duration || 30, [Validators.required, Validators.min(15)]],
      price: [data?.price || 0, [Validators.required, Validators.min(0.01)]],
      active: [data?.active ?? true]
    });

    // Get current professional ID
    this.authService.currentUser.subscribe(user => {
         if (user && user.type === 'professional' && user.professional) {
             this.currentProfessionalId = user.professional.id;
         }
    });
  }

  save(): void {
    if (this.serviceForm.invalid) return;
    this.loading = true;

    const formValue = this.serviceForm.value;

    if (this.isEdit && this.data) {
      this.serviceService.updateService(this.data.id, formValue).subscribe({
        next: (res: Service) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
          if (err.status === 404) {
            this.snackBar.open('Serviço não encontrado. Ele pode ter sido excluído.', 'Fechar', { duration: 3000 });
            this.dialogRef.close(); // Close dialog as service is gone
          } else {
            this.snackBar.open('Erro ao atualizar serviço: ' + (err.error?.detail || 'Erro desconhecido'), 'Fechar', { duration: 3000 });
          }
        }
      });
    } else {
      if (!this.currentProfessionalId) {
          this.snackBar.open('Erro: Profissional não identificado', 'Fechar', { duration: 3000 });
          this.loading = false;
          return;
      }
      
      const newService = {
        ...formValue,
        professional_id: this.currentProfessionalId
      };
      
      this.serviceService.createService(newService).subscribe({
        next: (res: Service) => {
          this.loading = false;
          this.dialogRef.close(res);
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
          this.snackBar.open('Erro ao criar serviço', 'Fechar', { duration: 3000 });
        }
      });
    }
  }
}
