import { of } from 'rxjs'; // We need rxjs 'of' for mocking observables
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: any;
  let storageServiceSpy: any;
  let routerSpy: any;

  beforeEach(() => {
    storageServiceSpy = {
      getToken: vi.fn(),
      setToken: vi.fn(),
      setUser: vi.fn(),
      getUser: vi.fn(),
      clear: vi.fn()
    };
    
    routerSpy = {
      navigate: vi.fn()
    };

    httpMock = {
      post: vi.fn(),
      get: vi.fn()
    };

    service = new AuthService(
      httpMock as any,
      routerSpy,
      storageServiceSpy
    );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      const mockResponse = { access_token: 'fake-jwt-token', token_type: 'bearer' };
      const email = 'test@example.com';
      const password = 'password';
      const mockUser = { id: 1, email: 'test@example.com', nome: 'Test' };

      // Mock http.post to return observable of mockResponse
      httpMock.post.mockReturnValue(of(mockResponse));
      // Mock http.get (for loadCurrentUser) to return observable of mockUser
      httpMock.get.mockReturnValue(of(mockUser));

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(mockUser as any);
      });

      expect(httpMock.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/access-token'),
        expect.stringContaining(`username=${encodeURIComponent(email)}`),
        expect.objectContaining({ headers: expect.any(Object) })
      );

      // Verify secondary call to users/me could happen or happens via side effect
      // In current implementation login sets token then calls loadCurrentUser
      expect(storageServiceSpy.setToken).toHaveBeenCalledWith('fake-jwt-token');
      expect(storageServiceSpy.setUser).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('logout', () => {
    it('should clear storage and navigate to login', () => {
      service.logout();

      expect(storageServiceSpy.clear).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('currentUser', () => {
    it('should initialize with user from storage', () => {
      const mockUser = { id: 1, email: 'test@example.com', nome: 'Test', tipo: 'client' };
      storageServiceSpy.getUser.mockReturnValue(mockUser);
      httpMock.get.mockReturnValue(of(mockUser)); // in case constructor calls it
      
      // Re-initialize service
      const newService = new AuthService(
        httpMock as any,
        routerSpy,
        storageServiceSpy
      );

      newService.currentUser$.subscribe(user => {
        expect(user).toEqual(mockUser as any);
      });
    });
  });
});
