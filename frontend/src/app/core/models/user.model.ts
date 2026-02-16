export enum UserType {
  PROFESSIONAL = 'professional',
  CLIENT = 'client'
}

export interface User {
  id: string; // UUID
  email: string;
  name: string;
  phone?: string;
  type: UserType;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  type: UserType;
}
