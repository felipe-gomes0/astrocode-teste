import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Block } from '../models/block.model';

@Injectable({
  providedIn: 'root'
})
export class BlockService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/blocks`;

  getBlocks(professionalId: number): Observable<Block[]> {
    return this.http.get<Block[]>(`${this.apiUrl}/?professional_id=${professionalId}`);
  }

  createBlock(block: Partial<Block>): Observable<Block> {
    return this.http.post<Block>(`${this.apiUrl}/`, block);
  }

  deleteBlock(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
