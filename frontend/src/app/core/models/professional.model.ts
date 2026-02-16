import { Service } from './service.model';
import { User } from './user.model';

export interface Professional {
  id: number;
  user_id: string; // UUID
  speciality?: string;
  description?: string;
  photo_url?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  services?: Service[];
}

export interface ProfessionalWithUser extends Professional {
  // Helper interface if we flatten the structure, but API returns nested user.
  // We can use optional chaining on 'user' property instead.
}
