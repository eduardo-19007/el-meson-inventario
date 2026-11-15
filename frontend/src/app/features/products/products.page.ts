import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';
import { Categoria, Producto, Unidad } from '../../core/models';

@Component({ selector: 'app-products-page', imports: [ReactiveFormsModule], templateUrl: './products.page.html' })
export class ProductsPage {
  private readonly api = inject(ApiService);
  readonly auth = inject(AuthService);
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly unidades = signal<Unidad[]>([]);
  readonly busqueda = signal('');
  readonly editando = signal<Producto | null>(null);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly filtrados = computed(() => {
    const term = this.busqueda().trim().toLocaleLowerCase('es');
    return this.productos().filter((p) => !term || `${p.codigo} ${p.nombre} ${p.categoria}`.toLocaleLowerCase('es').includes(term));
  });
  readonly form = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(30)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    categoriaId: new FormControl<number | null>(null, [Validators.required]),
    unidadId: new FormControl<number | null>(null, [Validators.required])
  });

  constructor() { this.cargar(); }

  cargar(): void {
    forkJoin({ productos: this.api.productos(), categorias: this.api.categorias(), unidades: this.api.unidades() }).subscribe({
      next: (data) => { this.productos.set(data.productos); this.categorias.set(data.categorias); this.unidades.set(data.unidades); },
      error: (error) => this.error.set(apiError(error))
    });
  }

  editar(producto: Producto): void {
    this.editando.set(producto);
    this.form.setValue({ codigo: producto.codigo, nombre: producto.nombre, categoriaId: producto.categoriaId, unidadId: producto.unidadId });
  }

  cancelar(): void { this.editando.set(null); this.form.reset(); this.error.set(''); }

  guardar(): void {
    if (this.form.invalid || this.guardando()) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const data = { codigo: value.codigo.trim(), nombre: value.nombre.trim(), categoriaId: value.categoriaId!, unidadId: value.unidadId! };
    const request = this.editando() ? this.api.productoEditar(this.editando()!.id, data) : this.api.productoCrear(data);
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    request.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => { this.mensaje.set('Producto guardado correctamente.'); this.cancelar(); this.cargar(); },
      error: (error) => this.error.set(apiError(error))
    });
  }

  cambiarEstado(producto: Producto): void {
    this.api.productoEstado(producto.id, !producto.activo).subscribe({ next: () => this.cargar(), error: (error) => this.error.set(apiError(error)) });
  }
}
