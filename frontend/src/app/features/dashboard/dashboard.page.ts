import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';
import { Existencia, Movimiento, Producto } from '../../core/models';

@Component({ selector: 'app-dashboard-page', templateUrl: './dashboard.page.html' })
export class DashboardPage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly productos = signal<Producto[]>([]);
  readonly existencias = signal<Existencia[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly error = signal('');
  readonly cargando = signal(true);

  constructor() { this.cargar(); }

  cargar(): void {
    const sedeId = this.auth.perfil()?.sedes.find((s) => s.activo)?.id;
    forkJoin({ productos: this.api.productos(), existencias: this.api.existencias(sedeId), movimientos: this.api.movimientos(sedeId) })
      .subscribe({
        next: ({ productos, existencias, movimientos }) => {
          this.productos.set(productos);
          this.existencias.set(existencias);
          this.movimientos.set(movimientos.slice(0, 6));
          this.cargando.set(false);
        },
        error: (error) => { this.error.set(apiError(error)); this.cargando.set(false); }
      });
  }

  bajoMinimo(): Existencia[] { return this.existencias().filter((item) => Number(item.cantidad) <= Number(item.minimo)); }
}
