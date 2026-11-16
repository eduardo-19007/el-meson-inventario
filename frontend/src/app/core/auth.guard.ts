import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.cargarPerfil().pipe(map((ok) => ok || router.createUrlTree(['/login'])));
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.cargarPerfil().pipe(
    map((ok) => ok && auth.esAdmin() ? true : router.createUrlTree(['/dashboard']))
  );
};
