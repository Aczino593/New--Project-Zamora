import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css']
})
export class AdminLogin {
  username = signal('');
  password = signal('');
  role = signal<'SECRETARIO' | 'DIRECTIVO'>('SECRETARIO');

  private authService = inject(AuthService);

  constructor(private router: Router) {}

  login() {
    // Al iniciar sesión, registramos en el AuthService que somos "admin"
    // para que el guard (authGuard) nos deje pasar a la ruta /admin
    this.authService.login(this.username(), 'admin');
    this.router.navigate(['/admin']);
  }
}
