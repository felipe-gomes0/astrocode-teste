import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginCredentials, User } from '../models/user.model';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser = this.currentUserSubject.asObservable();

  constructor() {
  }

  loadUserFromStorage(): Observable<any> {
    const token = localStorage.getItem('token');
    if (token) {
      return this.fetchCurrentUser().pipe(
          tap({
              error: (err) => {
                  if (err.status === 401 || err.status === 404) {
                      this.logout();
                  }
              }
          }),
          // Catch error so app doesn't crash on init
          catchError(() => of(null))
      );
    }
    return of(null);
  }

  login(credentials: LoginCredentials): Observable<User> {
    const body = new URLSearchParams();
    body.set('username', credentials.email);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}/access-token`, body.toString(), { headers })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.access_token);
        }),
        switchMap(() => this.fetchCurrentUser())
      );
  }

  register(user: Partial<User>): Observable<User> {
      return this.http.post<User>(`${environment.apiUrl}/users/`, user);
  }

  updateUser(userId: string, user: Partial<User>): Observable<User> {
      return this.http.put<User>(`${environment.apiUrl}/users/${userId}`, user).pipe(
          tap((updatedUser) => {
              this.currentUserSubject.next(updatedUser);
          })
      );
  }

  fetchCurrentUser(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
      return localStorage.getItem('token');
  }
}
