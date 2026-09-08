import { Component, HostListener, Inject, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CoursesService } from '../../core/services/courses.service';
import { NotificationService } from '../../core/services/notification.service';
import { Course } from '../../core/models';

@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './portal-layout.html',
  styleUrls: ['./portal-layout.css']
})
export class PortalLayout {
  public authService = inject(AuthService);
  private coursesService = inject(CoursesService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isSidebarOpen = false;
  isMobile = true;
  isBrowser = false;
  isProfileMenuOpen = false;

  user = computed(() => this.authService.currentUser());
  role = computed(() => this.authService.getRole());

  // Roles auxiliares
  isEstudiante = computed(() => this.role() === 'estudiante');
  isDocente = computed(() => this.role() === 'docente');
  isDelegado = computed(() => this.authService.isDelegado());
  isTutor = computed(() => this.role() === 'tutor');

  // Rutas base dinámicas según el rol
  homeRoute = computed(() => {
    const r = this.role();
    if (r === 'docente') return '/docentes/dashboard';
    if (r === 'tutor') return '/tutores/dashboard';
    if (r === 'preceptor') return '/preceptores/dashboard';
    return '/estudiantes/dashboard';
  });

  calendarRoute = computed(() => `/${this.role() === 'docente' ? 'docentes' : (this.role() === 'tutor' ? 'tutores' : 'estudiantes')}/calendario`);
  notifRoute = computed(() => `/${this.role() === 'docente' ? 'docentes' : (this.role() === 'tutor' ? 'tutores' : 'estudiantes')}/notificaciones`);
  configRoute = computed(() => `/${this.role() === 'docente' ? 'docentes' : (this.role() === 'tutor' ? 'tutores' : 'estudiantes')}/configuracion`);

  // 1. Crear Noticia: Visible ÚNICAMENTE para Estudiantes DELEGADOS / SUBDELEGADOS (isDelegado === true).
  //    Docentes NO lo tienen. Tutores NO. Alumnos regulares NO.
  canViewCrearNoticia = computed(() => this.isEstudiante() && this.isDelegado());
  crearNoticiaRoute = computed(() => '/estudiantes/crear-noticia');

  // 2. Chat: Visible ÚNICAMENTE para Estudiantes DELEGADOS / SUBDELEGADOS (renombrado de Informar a Chat para consultas de clases).
  //    Alumnos regulares NO ven ni Crear Noticia ni Chat.
  canViewChat = computed(() => this.isEstudiante() && this.isDelegado());
  chatRoute = computed(() => '/estudiantes/chat');

  // 3. Informar: Visible para Docentes (debajo de materias a cargo). Docentes NO tienen Crear Noticia.
  canViewInformar = computed(() => this.isDocente() || this.role() === 'preceptor');
  informarRoute = computed(() => this.isDocente() ? '/docentes/informar' : '/preceptores/informar');

  // Lista de cursos para el sidebar
  courses = computed<Course[]>(() => {
    const r = this.role();
    if (r === 'docente') {
      return this.coursesService.teacherCourses();
    }
    if (r === 'estudiante') {
      return this.coursesService.studentCourses();
    }
    return [];
  });

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
      this.isSidebarOpen = !this.isMobile;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isProfileMenuOpen = false;
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

  toggleDelegadoMode() {
    this.authService.toggleDelegadoStatus();
    const isDel = this.authService.isDelegado();
    this.notificationService.showInfo(`Modo estudiante: ${isDel ? 'Delegado (Crear Noticia y Chat habilitados)' : 'Alumno regular (Crear Noticia y Chat ocultos)'}`);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
