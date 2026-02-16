export interface Block {
  id: number;
  professional_id: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  reason?: string;
  created_at?: string;
}
