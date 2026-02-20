import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Appointment, AppointmentWithDetails } from '../../../core/models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/appointments`;

  getAvailableSlots(professionalId: number, date: string, serviceId: number): Observable<{ date: string; slots: string[] }> {
    return this.http.get<{ date: string; slots: string[] }>(
      `${this.apiUrl}/available-slots`,
      { params: { professional_id: professionalId, date, service_id: serviceId } }
    );
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(this.apiUrl, appointment);
  }

  createGuestAppointment(appointmentData: any): Observable<Appointment> {
    return this.http.post<Appointment>(`${environment.apiUrl}/guest-appointments/`, appointmentData);
  }

  getMyAppointments(): Observable<AppointmentWithDetails[]> {
    return this.http.get<AppointmentWithDetails[]>(`${this.apiUrl}/my-appointments`);
  }

  updateAppointment(id: number, data: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/${id}`, data);
  }

  cancelAppointment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
