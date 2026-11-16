import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { apiError } from '../../core/errors';
import { Sede, Usuario } from '../../core/models';

@Component({ selector: 'app-admin-page', imports: [ReactiveFormsModule], templateUrl: './admin.page.html' })
export class AdminPage {
  private readonly api = inject(ApiService);
  readonly sedes = signal<Sede[]>([]);
  readonly usuarios = signal<Usuario[]>([]);
  readonly tab = signal<'usuarios' | 'sedes'>('usuarios');
  readonly editandoUsuario = signal<Usuario | null>(null);
  readonly editandoSede = signal<Sede | null>(null);
  readonly guardando = signal(false);
  readonly mensaje = signal('');
  readonly error = signal('');

  readonly usuarioForm = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/[a-zA-Z0-9._-]{3,50}/)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(150)] }),
    password: new FormControl('', { nonNullable: true }),
    rol: new FormControl<'ADMIN' | 'ENCARGADO' | 'CONSULTOR'>('ENCARGADO', { nonNullable: true, validators: [Validators.required] }),
    sedeId: new FormControl<number | null>(null),
    activo: new FormControl(true, { nonNullable: true })
  });
  readonly sedeForm = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(250)] })
  });

  constructor() { this.cargar(); }
  cargar(): void { forkJoin({ sedes: this.api.sedes(), usuarios: this.api.usuarios() }).subscribe({ next: (r) => { this.sedes.set(r.sedes); this.usuarios.set(r.usuarios); }, error: (e) => this.error.set(apiError(e)) }); }
  nombreSedes(ids: number[]): string { return ids.map((id) => this.sedes().find((s) => s.id === id)?.nombre || id).join(', ') || 'Todas / sin asignación'; }

  editarUsuario(item: Usuario): void { this.tab.set('usuarios'); this.editandoUsuario.set(item); this.usuarioForm.setValue({ usuario: item.usuario, nombre: item.nombre, password: '', rol: item.rol, sedeId: item.sedes[0] || null, activo: item.activo }); }
  limpiarUsuario(): void { this.editandoUsuario.set(null); this.usuarioForm.reset({ usuario: '', nombre: '', password: '', rol: 'ENCARGADO', sedeId: null, activo: true }); }
  guardarUsuario(): void {
    const v = this.usuarioForm.getRawValue();
    if (this.usuarioForm.invalid || (!this.editandoUsuario() && v.password.length < 12) || (v.rol !== 'ADMIN' && !v.sedeId)) { this.usuarioForm.markAllAsTouched(); this.error.set('Completa los campos. Los usuarios nuevos requieren contraseña de 12 caracteres y una sede.'); return; }
    const data = { usuario: v.usuario, nombre: v.nombre, password: v.password || undefined, rol: v.rol, sedes: v.sedeId ? [v.sedeId] : [], activo: v.activo };
    const req = this.editandoUsuario() ? this.api.usuarioEditar(this.editandoUsuario()!.id, data) : this.api.usuarioCrear({ ...data, password: v.password });
    this.ejecutar(req, 'Usuario guardado.', () => this.limpiarUsuario());
  }

  editarSede(item: Sede): void { this.tab.set('sedes'); this.editandoSede.set(item); this.sedeForm.setValue({ codigo: item.codigo, nombre: item.nombre, direccion: item.direccion || '' }); }
  limpiarSede(): void { this.editandoSede.set(null); this.sedeForm.reset({ codigo: '', nombre: '', direccion: '' }); }
  guardarSede(): void {
    if (this.sedeForm.invalid) { this.sedeForm.markAllAsTouched(); return; }
    const data = this.sedeForm.getRawValue();
    const req = this.editandoSede() ? this.api.sedeEditar(this.editandoSede()!.id, data) : this.api.sedeCrear(data);
    this.ejecutar(req, 'Sede guardada.', () => this.limpiarSede());
  }
  cambiarSede(item: Sede): void { this.ejecutar(this.api.sedeEstado(item.id, !item.activo), 'Estado actualizado.'); }

  private ejecutar(request: Observable<unknown>, mensaje: string, after?: () => void): void {
    this.guardando.set(true); this.error.set(''); this.mensaje.set('');
    request.pipe(finalize(() => this.guardando.set(false))).subscribe({ next: () => { this.mensaje.set(mensaje); after?.(); this.cargar(); }, error: (e) => this.error.set(apiError(e)) });
  }
}
