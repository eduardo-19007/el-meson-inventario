import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { Auditoria, Categoria, DetalleMovimiento, Existencia, Kardex, Movimiento, Perfil, Producto, Sede, Transferencia, Unidad, Usuario } from './models';

interface CsrfResponse { token: string; headerName: string; }
type ProductoPayload = Pick<Producto, 'codigo' | 'nombre' | 'categoriaId' | 'unidadId'>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private csrf?: CsrfResponse;

  csrfToken(): Observable<CsrfResponse> {
    if (this.csrf) return of(this.csrf);
    return this.http.get<CsrfResponse>('/api/csrf').pipe(tap((value) => (this.csrf = value)));
  }

  login(usuario: string, password: string): Observable<void> {
    return this.csrfToken().pipe(switchMap((csrf) => this.http.post<void>(
      '/api/login',
      new URLSearchParams({ usuario, password }).toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded', [csrf.headerName]: csrf.token }) }
    )));
  }

  logout(): Observable<void> { return this.write<void>('POST', '/api/logout'); }
  me(): Observable<Perfil> { return this.http.get<Perfil>('/api/me'); }
  productos(): Observable<Producto[]> { return this.http.get<Producto[]>('/api/productos'); }
  categorias(): Observable<Categoria[]> { return this.http.get<Categoria[]>('/api/categorias'); }
  unidades(): Observable<Unidad[]> { return this.http.get<Unidad[]>('/api/unidades'); }

  productoCrear(data: ProductoPayload): Observable<Producto> {
    return this.write<Producto>('POST', '/api/productos', data);
  }

  productoEditar(id: number, data: ProductoPayload): Observable<Producto> {
    return this.write<Producto>('PUT', `/api/productos/${id}`, data);
  }

  productoEstado(id: number, activo: boolean): Observable<void> {
    return this.write<void>('PATCH', `/api/productos/${id}/${activo ? 'activar' : 'desactivar'}`);
  }

  existencias(sedeId?: number): Observable<Existencia[]> {
    const params = sedeId ? new HttpParams().set('sedeId', sedeId) : undefined;
    return this.http.get<any[]>('/api/existencias', { params }).pipe(map((rows) => rows.map((r) => ({
      sedeId: r.sede_id, sede: r.sede, productoId: r.producto_id, codigo: r.codigo, producto: r.producto,
      nombre: r.producto, unidad: r.unidad, cantidad: Number(r.cantidad), minimo: Number(r.stock_minimo)
    }))));
  }

  movimientos(sedeId?: number): Observable<Movimiento[]> {
    const params = sedeId ? new HttpParams().set('sedeId', sedeId) : undefined;
    return this.http.get<any[]>('/api/movimientos', { params }).pipe(map((rows) => rows.map((r) => ({
      id: r.id, sedeId: r.sede_id, sede: r.sede, tipo: r.tipo, motivo: r.motivo, referencia: r.referencia,
      proveedor: r.proveedor, fecha: r.fecha_registro, usuario: r.usuario
    }))));
  }

  detalleMovimiento(id: number): Observable<DetalleMovimiento> { return this.http.get<DetalleMovimiento>(`/api/movimientos/${id}`); }
  reversarMovimiento(id: number, motivo: string): Observable<Record<string, unknown>> { return this.write('POST', `/api/movimientos/${id}/reverso`, { motivo, idempotencia: crypto.randomUUID() }); }
  kardex(sedeId: number, productoId: number): Observable<Kardex[]> { return this.http.get<Kardex[]>('/api/kardex', { params: new HttpParams().set('sedeId', sedeId).set('productoId', productoId) }); }

  sedes(): Observable<Sede[]> { return this.http.get<Sede[]>('/api/sedes'); }
  usuarios(): Observable<Usuario[]> { return this.http.get<Usuario[]>('/api/usuarios'); }
  sedeCrear(data: Pick<Sede, 'codigo' | 'nombre' | 'direccion'>): Observable<{ id: number }> { return this.write('POST', '/api/sedes', data); }
  sedeEditar(id: number, data: Pick<Sede, 'codigo' | 'nombre' | 'direccion'>): Observable<{ id: number }> { return this.write('PUT', `/api/sedes/${id}`, data); }
  sedeEstado(id: number, activo: boolean): Observable<void> { return this.write('PATCH', `/api/sedes/${id}/estado?activo=${activo}`); }
  usuarioCrear(data: Omit<Usuario, 'id'> & { password: string }): Observable<{ id: number }> { return this.write('POST', '/api/usuarios', data); }
  usuarioEditar(id: number, data: Omit<Usuario, 'id'> & { password?: string }): Observable<{ id: number }> { return this.write('PUT', `/api/usuarios/${id}`, data); }
  destinos(): Observable<Pick<Sede, 'id' | 'nombre'>[]> { return this.http.get<Pick<Sede, 'id' | 'nombre'>[]>('/api/destinos'); }
  transferencias(): Observable<Transferencia[]> { return this.http.get<Transferencia[]>('/api/transferencias'); }
  transferenciaCrear(data: { origenId: number; destinoId: number; idempotencia: string; lineas: { productoId: number; cantidad: number; costoUnitario: null }[] }): Observable<Record<string, unknown>> { return this.write('POST', '/api/transferencias', data); }
  transferenciaAccion(id: number, accion: string, motivo: string): Observable<Record<string, unknown>> { return this.write('POST', `/api/transferencias/${id}/${accion}`, { motivo }); }
  ajustar(data: { sedeId: number; productoId: number; conteo: number; motivo: string; idempotencia: string }): Observable<Record<string, unknown>> { return this.write('POST', '/api/ajustes', data); }
  guardarMinimo(data: { sedeId: number; productoId: number; minimo: number }): Observable<void> { return this.write('POST', '/api/existencias/minimo', data); }
  auditoria(): Observable<Auditoria[]> { return this.http.get<Auditoria[]>('/api/auditoria'); }
  reporteExistenciasExcel(): Observable<Blob> { return this.http.get('/api/reportes/existencias.xlsx', { responseType: 'blob' }); }

  registrarMovimiento(data: {
    sedeId: number; tipo: string; motivo: string; referencia?: string; proveedor?: string;
    idempotencia: string; lineas: { productoId: number; cantidad: number; costoUnitario?: number | null }[];
  }): Observable<Record<string, unknown>> {
    return this.write<Record<string, unknown>>('POST', '/api/movimientos', data);
  }

  private write<T>(method: string, url: string, body?: unknown): Observable<T> {
    return this.csrfToken().pipe(switchMap((csrf) => this.http.request<T>(method, url, {
      body,
      headers: new HttpHeaders({ [csrf.headerName]: csrf.token })
    })));
  }
}
