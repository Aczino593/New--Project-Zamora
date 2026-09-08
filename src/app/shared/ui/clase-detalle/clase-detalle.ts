import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CoursesService } from '../../../core/services/courses.service';
import { Course } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

type ClassroomTab = 'novedades' | 'trabajos' | 'personas';

@Component({
  selector: 'app-clase-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './clase-detalle.html',
  styleUrls: ['./clase-detalle.css']
})
export class ClaseDetalleComponent {
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private coursesService = inject(CoursesService);
  private notificationService = inject(NotificationService);

  courseId = Number(this.route.snapshot.paramMap.get('id')) || 1;
  currentTab = signal<ClassroomTab>('novedades');

  course = signal<Course>({
    id: 1,
    nombre: '4° 3° CS',
    year: '4',
    divisionNumber: '3',
    cycle: 'superior',
    specialty: 'Informática',
    professor: 'Prof. Carlos Fernández',
    shift: 'Turno Mañana',
    room: 'Aula 12 - Taller de Informática',
    linkStudents: 'https://institucion.edu/join/43cs-info',
    linkProfessor: 'https://institucion.edu/prof/43cs-info-admin'
  });

  // Para publicación en tablón (docentes o delegados)
  newPostContent = signal('');

  posts = signal([
    {
      id: 1,
      author: 'Prof. Carlos Fernández',
      authorRole: 'Docente Titular',
      avatar: 'https://i.pravatar.cc/150?u=carlosf',
      date: 'Publicado hace 2 horas',
      content: '¡Buenas tardes a todos! Recordamos que la fecha para la prueba trimestral será el próximo viernes 20. El temario abarca la Unidad 1 y Trabajo Práctico N° 1.',
      isTeacher: true
    },
    {
      id: 2,
      author: 'Martina Rodríguez',
      authorRole: 'Delegada de Curso',
      avatar: 'https://i.pravatar.cc/150?u=martina',
      date: 'Ayer',
      content: 'Hola profes y compañeros, consultamos en preceptoría y el viernes abren el laboratorio de informática a las 09:30 hs para practicar.',
      isTeacher: false
    }
  ]);

  tasks = signal([
    {
      id: 1,
      title: 'Trabajo Práctico N° 1: Algoritmos y Estructuras',
      unit: 'Unidad 1 - Fundamentos',
      dueDate: 'Vence este viernes 23:59',
      points: '10 pts'
    },
    {
      id: 2,
      title: 'Guía de Ejercicios: Maquetación y Flexbox',
      unit: 'Unidad 2 - Diseño Web',
      dueDate: 'Vence el 28 de Septiembre',
      points: '10 pts'
    }
  ]);

  classmates = signal([
    { id: 1, name: 'Martina Rodríguez', role: 'Delegada', avatar: 'https://i.pravatar.cc/150?u=martina' },
    { id: 2, name: 'Lucas González', role: 'Subdelegado', avatar: 'https://i.pravatar.cc/150?u=2' },
    { id: 3, name: 'Juan Ignacio Pérez', role: 'Estudiante', avatar: 'https://i.pravatar.cc/150?u=3' },
    { id: 4, name: 'Lucía Gómez', role: 'Estudiante', avatar: 'https://i.pravatar.cc/150?u=4' },
    { id: 5, name: 'Sofía Martínez', role: 'Estudiante', avatar: 'https://i.pravatar.cc/150?u=5' }
  ]);

  constructor() {
    const found = this.coursesService.getCourseById(this.courseId);
    if (found) {
      this.course.set(found);
    }
  }

  get isDocente(): boolean {
    return this.authService.getRole() === 'docente';
  }

  get backLink(): string {
    const role = this.authService.getRole();
    if (role === 'docente') return '/docentes/dashboard';
    if (role === 'tutor') return '/tutores/dashboard';
    return '/estudiantes/dashboard';
  }

  setTab(tab: ClassroomTab) {
    this.currentTab.set(tab);
  }

  publishPost() {
    const text = this.newPostContent().trim();
    if (!text) return;

    const user = this.authService.currentUser();
    const newPost = {
      id: Date.now(),
      author: user?.name || 'Usuario',
      authorRole: user?.role === 'docente' ? 'Docente Titular' : (user?.isDelegado ? 'Delegado' : 'Estudiante'),
      avatar: user?.avatar || 'https://i.pravatar.cc/150?u=default',
      date: 'Recién',
      content: text,
      isTeacher: user?.role === 'docente'
    };

    this.posts.update(list => [newPost, ...list]);
    this.newPostContent.set('');
    this.notificationService.showSuccess('Mensaje publicado en el tablón de la clase.');
  }

  copyLink(type: 'student' | 'prof') {
    const link = type === 'student' ? this.course().linkStudents : this.course().linkProfessor;
    if (link) {
      navigator.clipboard?.writeText(link);
      this.notificationService.showSuccess('Enlace copiado al portapapeles.');
    }
  }
}
