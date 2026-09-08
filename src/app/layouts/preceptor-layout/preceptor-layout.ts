import { Component, HostListener, Inject, PLATFORM_ID, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-preceptor-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './preceptor-layout.html',
  styleUrls: ['./preceptor-layout.css']
})
export class PreceptorLayout {
  isSidebarOpen = false;
  isMobile = true;
  isBrowser = false;
  isProfileMenuOpen = false;

  private authService = inject(AuthService);
  private router = inject(Router);

  // Lista simulada de cursos a cargo (luego vendrá del backend)
  cursosAsignados = [
    { id: 1, nombre: '4°3° CS', info: 'Ciclo Superior' },
    { id: 2, nombre: 'Autogestión Aplicada', info: 'Ciclo Superior' },
    { id: 3, nombre: 'AAT 26', info: 'Ciclo Superior' },
    { id: 4, nombre: 'Mant de software 2026', info: 'Ciclo Superior' },
    { id: 5, nombre: '1ro 1ra CB', info: 'Ciclo Básico' }
  ];

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.isMobile = window.innerWidth < 768;
      this.isSidebarOpen = !this.isMobile;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (this.isBrowser) {
      this.isMobile = event.target.innerWidth < 768;
      if (!this.isMobile) {
        this.isSidebarOpen = true; // Siempre abierto en desktop
      } else {
        this.isSidebarOpen = false;
      }
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebarOnMobile() {
    if (this.isMobile) {
      this.isSidebarOpen = false;
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
