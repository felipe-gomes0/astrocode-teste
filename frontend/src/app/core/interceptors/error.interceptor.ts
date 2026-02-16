import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro';

      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        switch (error.status) {
          case 401:
            errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 422:
            // Erro de validação do FastAPI/Pydantic
            if (error.error?.detail && Array.isArray(error.error.detail)) {
              errorMessage = error.error.detail
                .map((err: any) => {
                  const field = err.loc[err.loc.length - 1];
                  return `${field}: ${err.msg}`;
                }) 
                .join('; ');
            } else {
              errorMessage = error.error?.detail || 'Erro de validação nos dados enviados.';
            }
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            if (error.error?.detail) {
              errorMessage = typeof error.error.detail === 'string' 
                ? error.error.detail 
                : 'Ocorreu um erro inesperado.';
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else {
              errorMessage = `Erro ${error.status}: ${error.statusText || 'Desconhecido'}`;
            }
        }
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
