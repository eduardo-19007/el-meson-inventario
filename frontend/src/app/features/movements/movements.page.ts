import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';
import { DetalleMovimiento, Movimiento, Producto } from '../../core/models';

@Component({ selector: 'app-movements-page', imports: [ReactiveFormsModule], templateUrl: './movements.page.html' })
export class MovementsPage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly productos = signal<Producto[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly totalMovimientos = signal(0);
  readonly sedeId = signal<number | null>(null);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly detalle = signal<DetalleMovimiento | null>(null);
  readonly form = new FormGroup({
    tipo: new FormControl('ENTRADA', { nonNullable: true, validators: [Validators.required] }),
    productoId: new FormControl<number | null>(null, [Validators.required]),
    cantidad: new FormControl<number | null>(null, [Validators.required, Validators.min(0.001)]),
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }),
    referencia: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(100)] }),
    proveedor: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] })
  });

  constructor() {
    this.sedeId.set(this.auth.perfil()?.sedes.find((s) => s.activo)?.id || null);
    this.cargar();
  }

  cargar(): void {
    forkJoin({ productos: this.api.productos(), movimientos: this.api.movimientos(this.sedeId() || undefined) }).subscribe({
      next: ({ productos, movimientos }) => { this.productos.set(productos.filter((p) => p.activo)); this.movimientos.set(movimientos); this.totalMovimientos.set(movimientos.length); },
      error: (error) => this.error.set(apiError(error))
    });
  }

  cambiarSede(value: string): void { this.sedeId.set(Number(value) || null); this.cargar(); }

  registrar(): void {
    if (this.form.invalid || !this.sedeId() || this.guardando()) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    this.api.registrarMovimiento({
      sedeId: this.sedeId()!, tipo: value.tipo, motivo: value.motivo.trim(), referencia: value.referencia.trim(),
      proveedor: value.proveedor.trim(), idempotencia: crypto.randomUUID(),
      lineas: [{ productoId: value.productoId!, cantidad: value.cantidad!, costoUnitario: null }]
    }).pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => { this.mensaje.set('Movimiento registrado correctamente.'); this.form.reset({ tipo: 'ENTRADA', productoId: null, cantidad: null, motivo: '', referencia: '', proveedor: '' }); this.cargar(); },
      error: (error) => this.error.set(apiError(error))
    });
  }

  verDetalle(id: number): void { this.error.set(''); this.api.detalleMovimiento(id).subscribe({ next: (r) => this.detalle.set(r), error: (e) => this.error.set(apiError(e)) }); }
  cerrarDetalle(): void { this.detalle.set(null); }
  reversar(item: Movimiento): void {
    const motivo = window.prompt(`Motivo para revertir el movimiento #${item.id}:`)?.trim();
    if (!motivo) return;
    this.guardando.set(true); this.error.set('');
    this.api.reversarMovimiento(item.id, motivo).pipe(finalize(() => this.guardando.set(false))).subscribe({ next: () => { this.mensaje.set(`Movimiento #${item.id} revertido.`); this.detalle.set(null); this.cargar(); }, error: (e) => this.error.set(apiError(e)) });
  }
}
