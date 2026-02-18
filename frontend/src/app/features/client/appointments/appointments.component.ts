import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentStatus, AppointmentWithDetails } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../professional/services/appointment.service';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private dialog = inject(MatDialog);

  appointments: AppointmentWithDetails[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Helper for template usage
  getFormattedDate(date: string): string {
      return this.formatDate(date);
  }

  formatDate(date: string): string {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR });
  }

  getStatusColor(status: AppointmentStatus): string {
    const colors: Record<string, string> = {
      [AppointmentStatus.PENDING]: 'warn',
      [AppointmentStatus.CONFIRMED]: 'primary',
      [AppointmentStatus.CANCELLED]: 'accent',
      [AppointmentStatus.COMPLETED]: 'accent'
    };
    return colors[status] || 'primary';
  }

  getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<string, string> = {
      [AppointmentStatus.PENDING]: 'Pendente',
      [AppointmentStatus.CONFIRMED]: 'Confirmado',
      [AppointmentStatus.CANCELLED]: 'Cancelado',
      [AppointmentStatus.COMPLETED]: 'Concluído'
    };
    return labels[status] || status;
  }

  canCancel(appointment: AppointmentWithDetails): boolean {
    const appointmentDate = new Date(appointment.data_hora);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return appointment.status !== AppointmentStatus.CANCELLED && 
           appointment.status !== AppointmentStatus.COMPLETED &&
           hoursUntilAppointment >= 24;
  }

  cancelAppointment(appointment: AppointmentWithDetails): void {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      this.appointmentService.cancelAppointment(appointment.id).subscribe({
        next: () => {
          this.loadAppointments();
        }
      });
    }
  }
}
