import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const router = inject(Router);
  return next(request.clone({ withCredentials: true })).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && !request.url.endsWith('/api/login')) void router.navigate(['/login']);
    return throwError(() => error);
  }));
};
