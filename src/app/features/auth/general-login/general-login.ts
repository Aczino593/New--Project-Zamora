import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-general-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general-login.html',
  styleUrls: ['./general-login.css']
})
export class GeneralLoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    // Inicialización segura del formulario (Strict Mode)
    this.loginForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(7), Validators.maxLength(9)]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      role: ['', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { dni, role } = this.loginForm.value;
      
      this.notificationService.showSuccess('Iniciando sesión...');
      
      // Registrar la sesión en el servicio para que el Guard nos deje pasar
      this.authService.login(dni, role);
      
      if (role === 'preceptor') {
        setTimeout(() => this.router.navigate(['/preceptores/dashboard']), 1000);
      } else {
        setTimeout(() => this.notificationService.showInfo('Este rol aún no tiene su panel desarrollado.'), 500);
      }
    } else {
      this.notificationService.showError('Por favor, revisa que todos los campos sean correctos.');
      // Marcar todos los campos como tocados para mostrar errores visuales
      this.loginForm.markAllAsTouched();
    }
  }

  // Helpers para la vista
  get dniControl() { return this.loginForm.get('dni'); }
  get passwordControl() { return this.loginForm.get('password'); }
  get roleControl() { return this.loginForm.get('role'); }
}
