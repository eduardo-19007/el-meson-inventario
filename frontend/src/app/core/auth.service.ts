import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, of, switchMap, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Perfil } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  readonly perfil = signal<Perfil | null>(null);
  readonly esAdmin = computed(() => this.perfil()?.rol === 'ADMIN');

  cargarPerfil(): Observable<boolean> {
    if (this.perfil()) return of(true);
    return this.api.me().pipe(
      tap((perfil) => this.perfil.set(perfil)),
      map(() => true),
      catchError(() => of(false))
    );
  }

  login(usuario: string, password: string): Observable<Perfil> {
    return this.api.login(usuario, password).pipe(
      switchMap(() => this.api.me()),
      tap((perfil) => this.perfil.set(perfil))
    );
  }

  logout(): void {
    this.api.logout().pipe(finalize(() => {
      this.perfil.set(null);
      void this.router.navigate(['/login']);
    })).subscribe({ error: () => undefined });
  }
}
