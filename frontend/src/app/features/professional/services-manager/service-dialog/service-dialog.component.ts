import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    MatSlideToggleModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Editar Serviço' : 'Novo Serviço' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="serviceForm">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Nome do Serviço</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Consulta Médica">
          <mat-error *ngIf="serviceForm.get('name')?.hasError('required')">Nome é obrigatório</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Ex: Detalhes do serviço..."></textarea>
        </mat-form-field>

        <div class="flex gap-4">
          <mat-form-field appearance="outline" class="w-half">
            <mat-label>Duração (min)</mat-label>
            <input matInput type="number" formControlName="duration">
            <mat-error *ngIf="serviceForm.get('duration')?.hasError('min')">Mínimo 15 minutos</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-half">
            <mat-label>Preço (R$)</mat-label>
            <input matInput type="number" formControlName="price">
            <mat-error *ngIf="serviceForm.get('price')?.hasError('min')">Preço deve ser positivo</mat-error>
          </mat-form-field>
        </div>

        <div class="py-2">
          <mat-slide-toggle formControlName="active">Ativo</mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="serviceForm.invalid || loading" (click)="save()">
        {{ loading ? 'Salvando...' : 'Salvar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full { width: 100%; }
    .w-half { width: 48%; }
    .flex { display: flex; }
    .gap-4 { gap: 1rem; }
  `]
})
export class ServiceDialogComponent {
  private fb = inject(FormBuilder);
  private serviceService = inject(ServiceManagementService);
  private authService = inject(AuthService); // Need auth to get professional ID for create

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
            alert('Serviço não encontrado. Ele pode ter sido excluído.');
            this.dialogRef.close(); // Close dialog as service is gone
          } else {
            alert('Erro ao atualizar serviço: ' + (err.error?.detail || 'Erro desconhecido'));
          }
        }
      });
    } else {
      if (!this.currentProfessionalId) {
          alert('Erro: Profissional não identificado');
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
          alert('Erro ao criar serviço');
        }
      });
    }
  }
}
