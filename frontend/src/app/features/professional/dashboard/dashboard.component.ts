import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  appointments: AppointmentWithDetails[] = [];
  upcomingAppointments: AppointmentWithDetails[] = [];
  stats: DashboardStats = {
    today: 0,
    pending: 0,
    thisWeek: 0,
    thisMonth: 0
  };
  loading = false;

  displayedColumns: string[] = ['date_time', 'client', 'service', 'status', 'actions'];

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
        this.cdr.detectChanges();
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
        const aptDate = parseISO(apt.date_time);
        return isToday(aptDate) && apt.status !== AppointmentStatus.CANCELLED;
      }).length,
      pending: this.appointments.filter(apt => 
        apt.status === AppointmentStatus.PENDING
      ).length,
      thisWeek: this.appointments.filter(apt => {
        const aptDate = parseISO(apt.date_time);
        return aptDate >= today && aptDate < weekFromNow && 
               apt.status !== AppointmentStatus.CANCELLED;
      }).length,
      thisMonth: this.appointments.filter(apt => {
        const aptDate = parseISO(apt.date_time);
        return aptDate >= today && aptDate < monthFromNow && 
               apt.status !== AppointmentStatus.CANCELLED;
      }).length
    };
  }

  getUpcomingAppointments(): void {
    const now = new Date();
    this.upcomingAppointments = this.appointments
      .filter(apt => {
        const aptDate = parseISO(apt.date_time);
        return aptDate >= now && apt.status !== AppointmentStatus.CANCELLED;
      })
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
      .slice(0, 5);
  }

  formatDate(date: string): string {
    return format(parseISO(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  }

  confirmAppointment(appointment: AppointmentWithDetails): void {
    this.appointmentService.updateAppointment(appointment.id, {
      status: AppointmentStatus.CONFIRMED
    }).subscribe({
      next: () => {
        this.loadAppointments();
      }
    });
  }

  completeAppointment(appointment: AppointmentWithDetails): void {
    this.appointmentService.updateAppointment(appointment.id, {
      status: AppointmentStatus.COMPLETED
    }).subscribe({
      next: () => {
        this.loadAppointments();
      }
    });
  }
}
