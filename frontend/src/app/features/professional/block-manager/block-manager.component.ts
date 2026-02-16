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
    MatNativeDateModule
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
            
            <div class="flex gap-4">
               <mat-form-field appearance="outline">
                 <mat-label>Início</mat-label>
                 <input matInput type="datetime-local" formControlName="start">
               </mat-form-field>

               <mat-form-field appearance="outline">
                 <mat-label>Fim</mat-label>
                 <input matInput type="datetime-local" formControlName="end">
               </mat-form-field>
            </div>

            <button mat-raised-button color="warn" type="submit" [disabled]="blockForm.invalid || loading">
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
    .mb-4 { margin-bottom: 1rem; }
    .pt-4 { padding-top: 1rem; }
  `]
})
export class BlockManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blockService = inject(BlockService);
  private authService = inject(AuthService);

  blockForm: FormGroup;
  blocks: Block[] = [];
  displayedColumns: string[] = ['reason', 'start', 'end', 'actions'];
  currentProfessionalId: number | null = null;
  loading = false;

  constructor() {
    this.blockForm = this.fb.group({
      reason: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      const u: any = user;
      if (u && u.professional) {
        this.currentProfessionalId = u.professional.id;
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
    if (this.blockForm.invalid || !this.currentProfessionalId) return;
    
    this.loading = true;
    const val = this.blockForm.value;
    
    // Simple validation
    if (new Date(val.start) >= new Date(val.end)) {
        alert('Data final deve ser maior que data inicial');
        this.loading = false;
        return;
    }

    const newBlock = {
      professional_id: this.currentProfessionalId,
      start_time: val.start, // Send as is (datetime-local string is mostly ISO compatible or needs conversion)
      end_time: val.end,
      reason: val.reason
    };

    this.blockService.createBlock(newBlock).subscribe({
      next: (res) => {
        this.loading = false;
        this.blocks.push(res); // or reload
        this.blockForm.reset();
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        alert('Erro ao criar bloqueio: ' + (err.error?.detail || 'Erro desconhecido'));
      }
    });
  }

  deleteBlock(block: Block): void {
    if (confirm('Deletar bloqueio?')) {
      this.blockService.deleteBlock(block.id).subscribe(() => {
        this.loadBlocks();
      });
    }
  }
}
