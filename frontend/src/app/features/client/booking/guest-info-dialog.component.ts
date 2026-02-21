import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-guest-info-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    NgxMaskDirective
  ],
  template: `
    <h2 mat-dialog-title>Informações do Agendamento</h2>
    <mat-dialog-content>
      <p class="dialog-subtitle">Para finalizar seu agendamento, precisamos de algumas informações básicas.</p>
      
      <form [formGroup]="guestForm" class="guest-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome Completo</mat-label>
          <input matInput formControlName="client_name" placeholder="Seu nome" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" formControlName="client_email" placeholder="seu@email.com" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telefone / WhatsApp</mat-label>
          <input matInput formControlName="client_phone" placeholder="(11) 99999-9999" mask="(00) 00000-0000" [showMaskTyped]="true" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="guestForm.invalid" (click)="onSubmit()">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-subtitle {
      margin-bottom: 20px;
      color: #64748b;
    }
    .guest-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 8px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class GuestInfoDialogComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<GuestInfoDialogComponent>);

  guestForm: FormGroup = this.fb.group({
    client_name: ['', Validators.required],
    client_email: ['', [Validators.required, Validators.email]],
    client_phone: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.guestForm.valid) {
      this.dialogRef.close(this.guestForm.value);
    }
  }
}
