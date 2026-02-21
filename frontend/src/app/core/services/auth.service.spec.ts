import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { User, UserType } from '../models/user.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy = { navigate: vi.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login should return user and store token', () => {
    const mockToken = 'fake-token';
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test user',
      type: UserType.CLIENT,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    service.login({ email: 'test@example.com', password: 'password' }).subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    const reqToken = httpMock.expectOne(`${environment.apiUrl}/auth/access-token`);
    expect(reqToken.request.method).toBe('POST');
    reqToken.flush({ access_token: mockToken, token_type: 'bearer' });

    const reqUser = httpMock.expectOne(`${environment.apiUrl}/users/me`);
    expect(reqUser.request.method).toBe('GET');
    reqUser.flush(mockUser);
  });

  it('should logout', () => {
    localStorage.setItem('token', 'fake-token');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
