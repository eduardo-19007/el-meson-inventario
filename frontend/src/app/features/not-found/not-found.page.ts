import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'app-not-found-page', imports: [RouterLink], template: `<main class="not-found"><p class="eyebrow">ERROR 404</p><h1>Página no encontrada</h1><p>La dirección solicitada no existe.</p><a class="button primary" routerLink="/dashboard">Volver al dashboard</a></main>` })
export class NotFoundPage {}
