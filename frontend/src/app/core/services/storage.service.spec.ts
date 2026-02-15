import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    service = new StorageService();
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Token Management', () => {
    it('should set and get token', () => {
      const token = 'test-token';
      service.setToken(token);
      expect(service.getToken()).toBe(token);
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('User Management', () => {
    const mockUser = { id: 1, name: 'Test User', email: 'test@example.com' };

    it('should set and get user', () => {
      service.setUser(mockUser);
      expect(service.getUser()).toEqual(mockUser);
      expect(localStorage.getItem('current_user')).toBe(JSON.stringify(mockUser));
    });

    it('should return null if no user exists', () => {
      expect(service.getUser()).toBeNull();
    });
  });

  describe('Clear', () => {
    it('should clear all stored data', () => {
      service.setToken('token');
      service.setUser({ id: 1 });
      
      service.clear();
      
      expect(service.getToken()).toBeNull();
      expect(service.getUser()).toBeNull();
      expect(localStorage.length).toBe(0);
    });
  });
});
