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
    this.loginForm = this.fb.group({
      dni: ['45678912', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.minLength(7), Validators.maxLength(9)]],
      password: ['123456', [Validators.required, Validators.minLength(5)]],
      role: ['estudiante', [Validators.required]]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { dni, role } = this.loginForm.value;
      
      this.notificationService.showSuccess('Iniciando sesión...');
      this.authService.login(dni, role);
      
      setTimeout(() => {
        if (role === 'estudiante') {
          this.router.navigate(['/estudiantes/dashboard']);
        } else if (role === 'docente') {
          this.router.navigate(['/docentes/dashboard']);
        } else if (role === 'tutor') {
          this.router.navigate(['/tutores/dashboard']);
        } else if (role === 'preceptor') {
          this.router.navigate(['/preceptores/dashboard']);
        } else if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/estudiantes/dashboard']);
        }
      }, 500);
    } else {
      this.notificationService.showError('Por favor, revisa que todos los campos sean correctos.');
      this.loginForm.markAllAsTouched();
    }
  }

  get dniControl() { return this.loginForm.get('dni'); }
  get passwordControl() { return this.loginForm.get('password'); }
  get roleControl() { return this.loginForm.get('role'); }
}
