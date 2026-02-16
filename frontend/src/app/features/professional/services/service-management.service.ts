import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Service } from '../../../core/models/service.model';

@Injectable({
  providedIn: 'root'
})
export class ServiceManagementService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/services`;

  getServicesByProfessional(professionalId: number): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/professional/${professionalId}`);
  }

  createService(service: Partial<Service>): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  updateService(id: number, service: Partial<Service>): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  deleteService(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
