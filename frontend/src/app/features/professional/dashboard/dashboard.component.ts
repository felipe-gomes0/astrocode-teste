import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { format, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentStatus, AppointmentWithDetails } from '../../../core/models/appointment.model';
import { AppointmentService } from '../../professional/services/appointment.service';

interface DashboardStats {
  today: number;
  pending: number;
  thisWeek: number;
  thisMonth: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  appointments: AppointmentWithDetails[] = [];
  upcomingAppointments: AppointmentWithDetails[] = [];
  stats: DashboardStats = {
    today: 0,
    pending: 0,
    thisWeek: 0,
    thisMonth: 0
  };
  loading = false;

  displayedColumns: string[] = ['data_hora', 'client', 'service', 'status', 'actions'];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.appointmentService.getMyAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.calculateStats();
        this.getUpcomingAppointments();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    this.stats = {
      today: this.appointments.filter(apt => {
        const aptDate = parseISO(apt.data_hora);
        return isToday(aptDate) && apt.status !== AppointmentStatus.CANCELADO;
      }).length,
      pending: this.appointments.filter(apt => 
        apt.status === AppointmentStatus.PENDENTE
      ).length,
      thisWeek: this.appointments.filter(apt => {
        const aptDate = parseISO(apt.data_hora);
        return aptDate >= today && aptDate < weekFromNow && 
               apt.status !== AppointmentStatus.CANCELADO;
      }).length,
      thisMonth: this.appointments.filter(apt => {
        const aptDate = parseISO(apt.data_hora);
        return aptDate >= today && aptDate < monthFromNow && 
               apt.status !== AppointmentStatus.CANCELADO;
      }).length
    };
  }

  getUpcomingAppointments(): void {
    const now = new Date();
    this.upcomingAppointments = this.appointments
      .filter(apt => {
        const aptDate = parseISO(apt.data_hora);
        return aptDate >= now && apt.status !== AppointmentStatus.CANCELADO;
      })
      .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())
      .slice(0, 5);
  }

  formatDate(date: string): string {
    return format(parseISO(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

  confirmAppointment(appointment: AppointmentWithDetails): void {
    this.appointmentService.updateAppointment(appointment.id, {
      status: AppointmentStatus.CONFIRMADO
    }).subscribe({
      next: () => {
        this.loadAppointments();
      }
    });
  }

  completeAppointment(appointment: AppointmentWithDetails): void {
    this.appointmentService.updateAppointment(appointment.id, {
      status: AppointmentStatus.CONCLUIDO
    }).subscribe({
      next: () => {
        this.loadAppointments();
      }
    });
  }
}
