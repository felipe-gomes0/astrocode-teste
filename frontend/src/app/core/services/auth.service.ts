import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface User {
  id: number;
  email: string;
  nome: string;
  tipo: 'professional' | 'client';
  telefone?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  public isAuthenticated$ = this.currentUser$.pipe(
    map(user => !!user)
  );

  constructor(
    private http: HttpClient,
    private router: Router,
    private storageService: StorageService
  ) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const user = this.storageService.getUser();
    if (user) {
      this.currentUserSubject.next(user);
    }
  }

  login(email: string, password: string): Observable<User> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/access-token`,
      body.toString(),
      { headers }
    ).pipe(
      tap(response => {
        this.storageService.setToken(response.access_token);
      }),
      switchMap(() => this.http.get<User>(`${environment.apiUrl}/users/me`)),
      tap({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.storageService.setUser(user);
        },
        error: () => {
          this.logout();
        }
      })
    );
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(
      `${environment.apiUrl}/auth/register`,
      userData
    );
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']); // Adjusted route
  }

  private loadCurrentUser(): void {
    this.http.get<User>(`${environment.apiUrl}/users/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.storageService.setUser(user);
      },
      error: () => {
        this.logout();
      }
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
