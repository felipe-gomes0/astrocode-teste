export interface Service {
  id: number;
  professional_id: number;
  name: string;
  description?: string;
  duration: number; // minutes
  price: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}
