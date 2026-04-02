import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest = req.url.includes('/auth/login') || req.url.includes('/auth/register');

      if (error.status === 401 && authService.isAuthenticated() && !isAuthRequest) {
        authService.clearSession();
        toastService.error('Your session expired. Please sign in again.');
      }

      if (error.status === 0) {
        toastService.error('Unable to reach the server right now.');
      }

      return throwError(() => error);
    })
  );
};
