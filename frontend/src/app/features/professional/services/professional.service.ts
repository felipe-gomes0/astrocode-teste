import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Professional } from '../../../core/models/professional.model';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/professionals`;

  searchProfessionals(especialidade?: string): Observable<Professional[]> {
    let url = this.apiUrl;
    const params: any = {};
    if (especialidade) {
      params.especialidade = especialidade;
    }
    return this.http.get<Professional[]>(url, { params });
  }

  getProfessional(id: number): Observable<Professional> {
    return this.http.get<Professional>(`${this.apiUrl}/${id}`);
  }

  updateProfessional(id: number, data: Partial<Professional>): Observable<Professional> {
    return this.http.put<Professional>(`${this.apiUrl}/${id}`, data);
  }
}
