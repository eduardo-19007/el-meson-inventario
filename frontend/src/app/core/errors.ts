import { HttpErrorResponse } from '@angular/common/http';
import { ApiProblem } from './models';

export function apiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ApiProblem | null;
    return [problem?.detail || 'No se pudo completar la operación.', ...Object.values(problem?.errores || {})].join(' ');
  }
  return 'Ocurrió un error inesperado.';
}
