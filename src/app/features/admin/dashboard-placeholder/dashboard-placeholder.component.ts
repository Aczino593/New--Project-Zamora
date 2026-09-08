import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard-placeholder',
  standalone: true,
  template: `
    <div style="padding: 20px; text-align: center;">
      <h2 style="color: #333; margin-bottom: 10px;">Bienvenido al Panel de Administración</h2>
      <p style="color: #666;">Selecciona una opción del menú lateral para comenzar.</p>
    </div>
  `
})
export class DashboardPlaceholderComponent {}
