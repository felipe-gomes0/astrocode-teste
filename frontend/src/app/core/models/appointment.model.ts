export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface Appointment {
  id: number;
  professional_id: number;
  client_id: string; // UUID
  service_id: number;
  data_hora: string;
  duracao: number;
  status: AppointmentStatus;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  // Extended properties populated by frontend logic or API joins
  professional_name?: string;
  client_name?: string;
  service_name?: string;
  service_price?: number;
}
