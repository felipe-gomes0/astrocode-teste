import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendar, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { InputMaskDirective } from '../../../core/directives/input-mask.directive';
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
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTabsModule,
    InputMaskDirective
  ],
  templateUrl: './block-manager.component.html',
  styleUrls: ['./block-manager.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BlockManagerComponent implements OnInit {
  private fb = inject(FormBuilder);
  private blockService = inject(BlockService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  blockForm: FormGroup;
  blocks: Block[] = [];
  selectedDate: Date | null = new Date();
  
  currentProfessionalId: number | null = null;
  loading = false;

  @ViewChild(MatCalendar) calendar: MatCalendar<Date> | undefined;

  constructor() {
    this.blockForm = this.fb.group({
      reason: [''], 
      startDate: [new Date(), Validators.required],
      startTime: ['', Validators.required],
      endDate: [new Date(), Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      if (user && user.type === 'professional' && user.professional) {
        this.currentProfessionalId = user.professional.id;
        this.updateDateClass();
        this.loadBlocks();
      }
    });
  }

  loadBlocks(): void {
    if (this.currentProfessionalId) {
      this.blockService.getBlocks(this.currentProfessionalId).subscribe(blocks => {
        this.blocks = blocks.sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        this.updateDateClass();
        this.calendar?.updateTodaysDate(); 
      });
    }
  }

  updateDateClass(): void {
    this.dateClass = (cellDate: Date): string => {
        const cellStart = new Date(cellDate);
        cellStart.setHours(0, 0, 0, 0);
        
        const cellEnd = new Date(cellStart);
        cellEnd.setDate(cellEnd.getDate() + 1);

        const cellStartTime = cellStart.getTime();
        const cellEndTime = cellEnd.getTime();

        const hasBlock = this.blocks.some(block => {
            const blockStart = new Date(block.start_time).getTime();
            const blockEnd = new Date(block.end_time).getTime();
            
            return blockStart < cellEndTime && blockEnd > cellStartTime;
        });

        if (hasBlock) {
            return 'blocked-day';
        }
        return '';
    };
  }

  dateClass = (date: Date): string => {
      return '';
  };

  onDateSelect(date: Date | null): void {
    this.selectedDate = date;
    if (date) {
      this.blockForm.patchValue({
        startDate: date,
        endDate: date
      });
    }
  }

  isBlockActiveOnDate(block: Block, date: Date | null): boolean {
    if (!date) return false;
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const blockStart = new Date(block.start_time);
    const blockEnd = new Date(block.end_time);

    return blockStart < nextDay && blockEnd > targetDate;
  }

  addBlock(): void {
    if (this.loading) return;

    if (this.blockForm.invalid) {
        this.snackBar.open('Preencha os campos obrigatórios', 'Fechar', { duration: 3000 });
        return;
    }

    if (!this.currentProfessionalId) {
        this.snackBar.open('Erro: Profissional não identificado', 'Fechar', { duration: 3000 });
        return;
    }
    
    this.loading = true;
    const val = this.blockForm.value;
    
    try {
        const start = this.combineDateTime(val.startDate, val.startTime);
        const end = this.combineDateTime(val.endDate, val.endTime);
        
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
            this.blocks.sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
            
            this.updateDateClass();
            this.calendar?.updateTodaysDate(); 
            
            this.blockForm.reset({
                startDate: this.selectedDate,
                endDate: this.selectedDate,
                startTime: '',
                endTime: '',
                reason: ''
            });
            this.snackBar.open('Horário bloqueado com sucesso!', 'Fechar', { duration: 3000 });
          },
          error: (err) => {
            this.loading = false;
            this.snackBar.open('Erro ao criar bloqueio', 'Fechar', { duration: 3000 });
          }
        });
    } catch (e) {
        this.loading = false;
        this.snackBar.open('Erro ao processar datas/horas', 'Fechar', { duration: 3000 });
    }
  }

  private combineDateTime(dateStr: string | Date, timeStr: string): Date {
      let date: Date;
      
      if (typeof dateStr === 'string' && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateStr);
      }

      const combined = new Date(date);
      const [hours, minutes] = timeStr.split(':').map(Number);
      combined.setHours(hours);
      combined.setMinutes(minutes);
      return combined;
  }

  deleteBlock(block: Block): void {
    if (confirm('Deletar bloqueio?')) {
      this.blockService.deleteBlock(block.id).subscribe(() => {
        this.blocks = this.blocks.filter(b => b.id !== block.id);
        this.snackBar.open('Bloqueio removido', 'Fechar', { duration: 3000 });
      });
    }
  }
}
