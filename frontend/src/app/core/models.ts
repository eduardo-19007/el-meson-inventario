export interface Sede { id: number; codigo: string; nombre: string; direccion?: string; activo: boolean; }
export interface Perfil { id: number; usuario: string; nombre: string; rol: 'ADMIN' | 'ENCARGADO' | 'CONSULTOR'; activo: boolean; sedes: Sede[]; }
export interface Categoria { id: number; nombre: string; activo: boolean; }
export interface Unidad { id: number; codigo: string; nombre: string; }
export interface Producto { id: number; codigo: string; nombre: string; categoriaId: number; categoria: string; unidadId: number; unidad: string; activo: boolean; }
export interface Existencia { sedeId: number; sede?: string; productoId: number; codigo?: string; producto?: string; nombre?: string; unidad?: string; cantidad: number; minimo: number; }
export interface Movimiento { id: number; sedeId: number; sede?: string; tipo: string; motivo: string; referencia?: string; proveedor?: string; fecha?: string; creadoEn?: string; usuario?: string; }
export interface Kardex { id: number; fecha_registro: string; tipo: string; motivo: string; referencia?: string; usuario: string; cantidad: number; entrada: number; salida: number; saldo: number; }
export interface DetalleMovimiento { id: number; sede_id: number; tipo: string; motivo: string; referencia?: string; fecha_registro?: string; reverso_de_id?: number; transferencia_id?: number; lineas: { producto_id: number; nombre: string; codigo: string; unidad: string; cantidad: number }[]; }
export interface Usuario { id: number; usuario: string; nombre: string; rol: 'ADMIN' | 'ENCARGADO' | 'CONSULTOR'; activo: boolean; sedes: number[]; }
export interface Transferencia { id: number; origen_id: number; destino_id: number; origen: string; destino: string; estado: string; incidencia?: string; creada_en?: string; }
export interface ApiProblem { status?: number; detail?: string; errores?: Record<string, string>; }
