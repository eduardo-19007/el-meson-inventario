import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';
import { Existencia, Kardex, Producto } from '../../core/models';

@Component({ selector: 'app-stock-control-page', imports: [ReactiveFormsModule], templateUrl: './stock-control.page.html' })
export class StockControlPage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly existencias = signal<Existencia[]>([]);
  readonly totalExistencias = signal(0);
  readonly productos = signal<Producto[]>([]);
  readonly sedeId = signal<number | null>(null);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly kardex = signal<Kardex[]>([]);
  readonly productoKardex = signal<Producto | null>(null);
  readonly ajusteForm = new FormGroup({ productoId: new FormControl<number | null>(null, Validators.required), conteo: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]), motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(300)] }) });
  readonly minimoForm = new FormGroup({ productoId: new FormControl<number | null>(null, Validators.required), minimo: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]) });

  constructor() { this.sedeId.set(this.auth.perfil()?.sedes.find((s) => s.activo)?.id || null); this.cargar(); }
  cambiarSede(value: string): void { this.sedeId.set(Number(value) || null); this.cargar(); }
  cargar(): void { if (!this.sedeId()) return; forkJoin({ existencias: this.api.existencias(this.sedeId()!), productos: this.api.productos() }).subscribe({ next: (r) => { this.existencias.set(r.existencias); this.totalExistencias.set(r.existencias.length); this.productos.set(r.productos.filter((p) => p.activo)); }, error: (e) => this.error.set(apiError(e)) }); }
  ajustar(): void { if (this.ajusteForm.invalid || !this.sedeId()) { this.ajusteForm.markAllAsTouched(); return; } const v = this.ajusteForm.getRawValue(); this.procesar(this.api.ajustar({ sedeId: this.sedeId()!, productoId: v.productoId!, conteo: v.conteo!, motivo: v.motivo.trim(), idempotencia: crypto.randomUUID() }), 'Inventario ajustado al conteo físico.', () => this.ajusteForm.reset({ productoId: null, conteo: null, motivo: '' })); }
  guardarMinimo(): void { if (this.minimoForm.invalid || !this.sedeId()) { this.minimoForm.markAllAsTouched(); return; } const v = this.minimoForm.getRawValue(); this.procesar(this.api.guardarMinimo({ sedeId: this.sedeId()!, productoId: v.productoId!, minimo: v.minimo! }), 'Stock mínimo actualizado.', () => this.minimoForm.reset({ productoId: null, minimo: null })); }
  seleccionar(item: Existencia): void { this.minimoForm.setValue({ productoId: item.productoId, minimo: item.minimo }); }
  verKardex(item: Existencia): void { const producto = this.productos().find((p) => p.id === item.productoId) || null; this.productoKardex.set(producto); this.api.kardex(this.sedeId()!, item.productoId).subscribe({ next: (r) => this.kardex.set(r), error: (e) => this.error.set(apiError(e)) }); }
  cerrarKardex(): void { this.productoKardex.set(null); this.kardex.set([]); }
  private procesar(request: Observable<unknown>, texto: string, despues: () => void): void { this.guardando.set(true); this.error.set(''); this.mensaje.set(''); request.pipe(finalize(() => this.guardando.set(false))).subscribe({ next: () => { this.mensaje.set(texto); despues(); this.cargar(); }, error: (e) => this.error.set(apiError(e)) }); }
}
