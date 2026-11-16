import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';
import { Producto, Sede, Transferencia } from '../../core/models';

@Component({ selector: 'app-transfers-page', imports: [ReactiveFormsModule], templateUrl: './transfers.page.html' })
export class TransfersPage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly transferencias = signal<Transferencia[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly destinos = signal<Pick<Sede, 'id' | 'nombre'>[]>([]);
  readonly procesando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly form = new FormGroup({
    origenId: new FormControl<number | null>(null, Validators.required),
    destinoId: new FormControl<number | null>(null, Validators.required),
    productoId: new FormControl<number | null>(null, Validators.required),
    cantidad: new FormControl<number | null>(null, [Validators.required, Validators.min(0.001)])
  });

  constructor() {
    const primera = this.auth.perfil()?.sedes.find((s) => s.activo)?.id || null;
    this.form.patchValue({ origenId: primera });
    this.cargar();
  }

  cargar(): void {
    forkJoin({ transferencias: this.api.transferencias(), productos: this.api.productos(), destinos: this.api.destinos() }).subscribe({
      next: (r) => { this.transferencias.set(r.transferencias); this.productos.set(r.productos.filter((p) => p.activo)); this.destinos.set(r.destinos); },
      error: (e) => this.error.set(apiError(e))
    });
  }

  crear(): void {
    if (this.form.invalid || this.procesando()) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    if (v.origenId === v.destinoId) { this.error.set('El origen y el destino deben ser diferentes.'); return; }
    this.ejecutar(this.api.transferenciaCrear({ origenId: v.origenId!, destinoId: v.destinoId!, idempotencia: crypto.randomUUID(), lineas: [{ productoId: v.productoId!, cantidad: v.cantidad!, costoUnitario: null }] }), 'Transferencia creada como borrador.', () => this.form.patchValue({ productoId: null, cantidad: null }));
  }

  accion(item: Transferencia, accion: string): void {
    let motivo = 'Operación confirmada';
    if (['cancelar', 'incidencia', 'devolver'].includes(accion)) {
      motivo = window.prompt('Indica el motivo de la operación:')?.trim() || '';
      if (!motivo) return;
    }
    this.ejecutar(this.api.transferenciaAccion(item.id, accion, motivo), `Transferencia #${item.id} actualizada.`);
  }

  puedeOperarSede(id: number): boolean { return this.auth.esAdmin() || !!this.auth.perfil()?.sedes.some((s) => s.id === id); }

  private ejecutar(request: ReturnType<ApiService['transferenciaAccion']>, mensaje: string, despues?: () => void): void {
    this.procesando.set(true); this.error.set(''); this.mensaje.set('');
    request.pipe(finalize(() => this.procesando.set(false))).subscribe({ next: () => { this.mensaje.set(mensaje); despues?.(); this.cargar(); }, error: (e) => this.error.set(apiError(e)) });
  }
}
