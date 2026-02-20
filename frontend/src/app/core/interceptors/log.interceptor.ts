import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { LogService } from '../services/log.service';

export const logInterceptor: HttpInterceptorFn = (req, next) => {
  const logService = inject(LogService);
  const startTime = Date.now();

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        // Capture trace_id from backend response header
        const traceId = event.headers.get('X-Trace-Id') || undefined;
        const duration = Date.now() - startTime;

        // Only log errors or slow requests (>2s) to avoid noise
        if (duration > 2000) {
          logService.warn(
            'SLOW_REQUEST',
            `${req.method} ${req.urlWithParams} took ${duration}ms`,
            traceId,
            { duration, status: event.status }
          );
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      const traceId = error.headers?.get('X-Trace-Id') || undefined;
      const duration = Date.now() - startTime;

      logService.error(
        'HTTP_ERROR',
        `${req.method} ${req.urlWithParams} failed with ${error.status}`,
        traceId,
        {
          status: error.status,
          statusText: error.statusText,
          duration,
          url: req.urlWithParams,
        }
      );

      return throwError(() => error);
    })
  );
};
