export interface Sede { id: number; codigo: string; nombre: string; direccion?: string; activo: boolean; }
export interface Perfil { id: number; usuario: string; nombre: string; rol: 'ADMIN' | 'ENCARGADO' | 'CONSULTOR'; activo: boolean; sedes: Sede[]; }
export interface Categoria { id: number; nombre: string; activo: boolean; }
export interface Unidad { id: number; codigo: string; nombre: string; }
export interface Producto { id: number; codigo: string; nombre: string; categoriaId: number; categoria: string; unidadId: number; unidad: string; activo: boolean; }
export interface Existencia { sedeId: number; sede?: string; productoId: number; codigo?: string; producto?: string; nombre?: string; unidad?: string; cantidad: number; minimo: number; }
export interface Movimiento { id: number; sedeId: number; sede?: string; tipo: string; motivo: string; referencia?: string; proveedor?: string; fecha?: string; creadoEn?: string; usuario?: string; }
export interface ApiProblem { status?: number; detail?: string; errores?: Record<string, string>; }
