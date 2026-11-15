import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { apiError } from '../../core/errors';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    usuario: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });

  ingresar(): void {
    if (this.form.invalid || this.enviando()) { this.form.markAllAsTouched(); return; }
    this.enviando.set(true);
    this.error.set('');
    const { usuario, password } = this.form.getRawValue();
    this.auth.login(usuario, password).pipe(finalize(() => this.enviando.set(false))).subscribe({
      next: () => void this.router.navigate(['/dashboard']),
      error: (error) => this.error.set(apiError(error))
    });
  }
}
