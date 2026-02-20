import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

interface FrontendLog {
  action: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  trace_id?: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class LogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/logs/frontend`;

  private buffer: FrontendLog[] = [];
  private flushInterval = 3000; // ms
  private maxBufferSize = 20;

  constructor() {
    // Flush buffer periodically
    setInterval(() => this.flush(), this.flushInterval);
  }

  error(action: string, message: string, traceId?: string, metadata?: Record<string, unknown>): void {
    this.addToBuffer({ action, message, level: 'error', trace_id: traceId, metadata });
  }

  warn(action: string, message: string, traceId?: string, metadata?: Record<string, unknown>): void {
    this.addToBuffer({ action, message, level: 'warn', trace_id: traceId, metadata });
  }

  info(action: string, message: string, traceId?: string, metadata?: Record<string, unknown>): void {
    this.addToBuffer({ action, message, level: 'info', trace_id: traceId, metadata });
  }

  private addToBuffer(log: FrontendLog): void {
    log.timestamp = new Date().toISOString();
    this.buffer.push(log);

    if (this.buffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.buffer.length === 0) return;

    const logs = [...this.buffer];
    this.buffer = [];

    // Send each log individually (backend expects single log per request)
    for (const log of logs) {
      this.http.post(this.apiUrl, log).subscribe({
        error: () => {
          // Fallback to console — never propagate
          console.error('[LogService Fallback]', log.action, log.message);
        },
      });
    }
  }
}
