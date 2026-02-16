import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Service } from '../../../../core/models/service.model';

@Component({
  selector: 'app-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './service-dialog.component.html'
})
export class ServiceDialogComponent {
  private fb = inject(FormBuilder);
  
  serviceForm: FormGroup;
  isEdit = false;

  constructor(
    public dialogRef: MatDialogRef<ServiceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Partial<Service>
  ) {
    this.isEdit = !!data.id;
    this.serviceForm = this.fb.group({
      name: [data.name || '', Validators.required],
      description: [data.description || ''],
      duration: [data.duration || 30, [Validators.required, Validators.min(1)]],
      price: [data.price || 0, [Validators.required, Validators.min(0)]],
      active: [data.active !== false] 
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.dialogRef.close(this.serviceForm.value);
    }
  }
}
