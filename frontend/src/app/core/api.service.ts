import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap, tap } from 'rxjs';
import { Categoria, Existencia, Movimiento, Perfil, Producto, Unidad } from './models';

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
    return this.http.get<Existencia[]>('/api/existencias', { params });
  }

  movimientos(sedeId?: number): Observable<Movimiento[]> {
    const params = sedeId ? new HttpParams().set('sedeId', sedeId) : undefined;
    return this.http.get<Movimiento[]>('/api/movimientos', { params });
  }

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
