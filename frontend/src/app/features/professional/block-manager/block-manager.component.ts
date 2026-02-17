import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Block } from '../../../core/models/block.model';
import { AuthService } from '../../../core/services/auth.service';
import { BlockService } from '../../../core/services/block.service';

@Component({
  selector: 'app-block-manager',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="container p-4">
      <mat-card class="mb-4">
        <mat-card-header>
          <mat-card-title>Bloqueios de Agenda</mat-card-title>
        </mat-card-header>
        <mat-card-content class="pt-4">
          <form [formGroup]="blockForm" (ngSubmit)="addBlock()" class="flex flex-col gap-4">
            <mat-form-field appearance="outline">
              <mat-label>Motivo</mat-label>
              <input matInput formControlName="reason" placeholder="Ex: Férias, Médico">
            </mat-form-field>
            
            <!-- Start -->
            <div class="flex gap-4">
              <mat-form-field appearance="outline" class="flex-1">
                <mat-label>Data Início</mat-label>
                <input matInput [matDatepicker]="pickerStart" formControlName="startDate">
                <mat-datepicker-toggle matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
                <mat-datepicker #pickerStart></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-32">
                <mat-label>Hora Início</mat-label>
                <input matInput type="time" formControlName="startTime">
              </mat-form-field>
            </div>

            <!-- End -->
            <div class="flex gap-4">
               <mat-form-field appearance="outline" class="flex-1">
                 <mat-label>Data Fim</mat-label>
                 <input matInput [matDatepicker]="pickerEnd" formControlName="endDate">
                 <mat-datepicker-toggle matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
                 <mat-datepicker #pickerEnd></mat-datepicker>
               </mat-form-field>

               <mat-form-field appearance="outline" class="w-32">
                 <mat-label>Hora Fim</mat-label>
                 <input matInput type="time" formControlName="endTime">
               </mat-form-field>
            </div>

            <button mat-raised-button color="warn" type="submit">
              Bloquear Horário
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="blocks" class="w-full">
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef> Motivo </th>
              <td mat-cell *matCellDef="let block"> {{block.reason || 'Sem motivo'}} </td>
            </ng-container>

            <ng-container matColumnDef="start">
              <th mat-header-cell *matHeaderCellDef> Início </th>
              <td mat-cell *matCellDef="let block"> {{block.start_time | date:'short'}} </td>
            </ng-container>

            <ng-container matColumnDef="end">
              <th mat-header-cell *matHeaderCellDef> Fim </th>
              <td mat-cell *matCellDef="let block"> {{block.end_time | date:'short'}} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Ações </th>
              <td mat-cell *matCellDef="let block">
                <button mat-icon-button color="warn" (click)="deleteBlock(block)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; }
    .w-full { width: 100%; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .gap-4 { gap: 1rem; }
    .flex-1 { flex: 1; }
    .w-32 { width: 8rem; }
    .mb-4 { margin-bottom: 1rem; }
    .pt-4 { padding-top: 1rem; }
  `]
})
export class BlockManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blockService = inject(BlockService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  blockForm: FormGroup;
  blocks: Block[] = [];
  displayedColumns: string[] = ['reason', 'start', 'end', 'actions'];
  currentProfessionalId: number | null = null;
  loading = false;

  constructor() {
    this.blockForm = this.fb.group({
      reason: [''], // Optional
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      if (user && user.type === 'professional' && user.professional) {
        this.currentProfessionalId = user.professional.id;
        this.loadBlocks();
      }
    });
  }

  loadBlocks(): void {
    if (this.currentProfessionalId) {
      this.blockService.getBlocks(this.currentProfessionalId).subscribe(blocks => {
        this.blocks = blocks;
      });
    }
  }

  addBlock(): void {
    if (this.loading) return;

    if (this.blockForm.invalid) {
        if (this.blockForm.get('startDate')?.hasError('required')) this.snackBar.open('Data inicial é obrigatória', 'Fechar', { duration: 3000 });
        else if (this.blockForm.get('startTime')?.hasError('required')) this.snackBar.open('Hora inicial é obrigatória', 'Fechar', { duration: 3000 });
        else if (this.blockForm.get('endDate')?.hasError('required')) this.snackBar.open('Data final é obrigatória', 'Fechar', { duration: 3000 });
        else if (this.blockForm.get('endTime')?.hasError('required')) this.snackBar.open('Hora final é obrigatória', 'Fechar', { duration: 3000 });
        return;
    }

    if (!this.currentProfessionalId) {
        this.snackBar.open('Erro: Profissional não identificado', 'Fechar', { duration: 3000 });
        return;
    }
    
    this.loading = true;
    const val = this.blockForm.value;
    
    // Combine Date and Time
    const start = this.combineDateTime(val.startDate, val.startTime);
    const end = this.combineDateTime(val.endDate, val.endTime);
    
    // Simple validation
    if (start >= end) {
        this.snackBar.open('Data final deve ser maior que data inicial', 'Fechar', { duration: 3000 });
        this.loading = false;
        return;
    }

    const newBlock = {
      professional_id: this.currentProfessionalId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      reason: val.reason
    };

    this.blockService.createBlock(newBlock).subscribe({
      next: (res) => {
        this.loading = false;
        this.blocks.push(res); 
        this.blockForm.reset();
        this.snackBar.open('Horário bloqueado com sucesso!', 'Fechar', { duration: 3000 });
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.snackBar.open('Erro ao criar bloqueio: ' + (err.error?.detail || 'Erro desconhecido'), 'Fechar', { duration: 3000 });
      }
    });
  }

  private combineDateTime(date: Date, time: string): Date {
      const combined = new Date(date);
      const [hours, minutes] = time.split(':').map(Number);
      combined.setHours(hours);
      combined.setMinutes(minutes);
      return combined;
  }

  deleteBlock(block: Block): void {
    if (confirm('Deletar bloqueio?')) {
      this.blockService.deleteBlock(block.id).subscribe(() => {
        this.loadBlocks();
      });
    }
  }
}
