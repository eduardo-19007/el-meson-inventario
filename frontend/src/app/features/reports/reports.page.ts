import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';
import { Auditoria, Existencia, Movimiento, Transferencia } from '../../core/models';

@Component({ selector: 'app-reports-page', templateUrl: './reports.page.html' })
export class ReportsPage {
  private readonly api = inject(ApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  readonly auth = inject(AuthService);
  readonly existencias = signal<Existencia[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly transferencias = signal<Transferencia[]>([]);
  readonly auditoria = signal<Auditoria[]>([]);
  readonly error = signal('');
  readonly totalStock = signal(0);
  readonly alertas = signal<Existencia[]>([]);
  readonly resumen = signal({ movimientos: 0, transferencias: 0 });

  constructor() { this.cargar(); }
  cargar(): void {
    forkJoin({ existencias: this.api.existencias(), movimientos: this.api.movimientos(), transferencias: this.api.transferencias(), auditoria: this.auth.esAdmin() ? this.api.auditoria() : of([] as Auditoria[]) }).subscribe({
      next: (r) => {
        this.existencias.set(r.existencias); this.movimientos.set(r.movimientos); this.transferencias.set(r.transferencias); this.auditoria.set(r.auditoria);
        this.totalStock.set(r.existencias.reduce((total, e) => total + Number(e.cantidad), 0));
        this.alertas.set(r.existencias.filter((e) => Number(e.cantidad) <= Number(e.minimo)));
        this.resumen.set({ movimientos: r.movimientos.length, transferencias: r.transferencias.length });
        this.cdr.detectChanges();
      },
      error: (e) => this.error.set(apiError(e))
    });
  }

  exportarStock(): void { this.csv('reporte_existencias.csv', ['Sede', 'Código', 'Producto', 'Unidad', 'Cantidad', 'Mínimo'], this.existencias().map((e) => [e.sede, e.codigo, e.producto, e.unidad, e.cantidad, e.minimo])); }
  exportarMovimientos(): void { this.csv('reporte_movimientos.csv', ['ID', 'Sede', 'Tipo', 'Motivo', 'Referencia', 'Usuario', 'Fecha'], this.movimientos().map((m) => [m.id, m.sede, m.tipo, m.motivo, m.referencia, m.usuario, m.fecha])); }
  private csv(nombre: string, cabecera: unknown[], filas: unknown[][]): void {
    const celda = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const contenido = [cabecera, ...filas].map((fila) => fila.map(celda).join(';')).join('\r\n');
    const enlace = document.createElement('a'); enlace.href = URL.createObjectURL(new Blob(['\ufeff', contenido], { type: 'text/csv;charset=utf-8' })); enlace.download = nombre; enlace.click(); URL.revokeObjectURL(enlace.href);
  }
}
