import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

export type NotificationType = 'message' | 'system' | 'docente';

export interface AppNotification {
  id: number;
  type: NotificationType;
  category: 'Dirección' | 'Sistema' | 'Docente' | 'Preceptoría';
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
  courseTarget?: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones {
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  // Modal para que los docentes redacten avisos
  isModalOpen = signal(false);
  newTitle = signal('');
  newCourse = signal('4° 3° CS - Informática');
  newCategory = signal<'Examen' | 'Tarea' | 'Aviso'>('Examen');
  newDescription = signal('');

  notifications = signal<AppNotification[]>([
    {
      id: 1,
      type: 'docente',
      category: 'Docente',
      title: 'Fecha para la prueba: Algoritmos y Estructuras',
      description: 'Prof. Carlos Fernández: El examen trimestral queda confirmado para el viernes 20 de septiembre.',
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // Hace 20 min
      isRead: false,
      courseTarget: '4° 3° CS'
    },
    {
      id: 2,
      type: 'message',
      category: 'Dirección',
      title: 'Mensaje de Dirección: Acto de Colación 2026',
      description: 'Dirección Técnica: Se publicaron las pautas de asistencia y protocolo para el acto conmemorativo institucional.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
      isRead: false
    },
    {
      id: 3,
      type: 'system',
      category: 'Sistema',
      title: 'Planillas de Calificaciones Actualizadas',
      description: 'El sistema ha consolidado las planillas del primer informe trimestral correspondientes a las divisiones del Ciclo Superior.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // Hace 5 horas
      isRead: true
    },
    {
      id: 4,
      type: 'system',
      category: 'Sistema',
      title: 'Mantenimiento del Servidor Escolar',
      description: 'Aviso técnico: Mantenimiento programado para este sábado a las 23:00 hs. La plataforma estará en modo consulta.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hace 1 día
      isRead: true
    }
  ]);

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  get isDocente(): boolean {
    return this.authService.getRole() === 'docente';
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays === 1) return `ayer`;
    return `hace ${diffDays} d`;
  }

  formatExactDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  markAsRead(id: number, event?: Event) {
    if (event) event.stopPropagation();
    const updated = this.notifications().map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notifications.set(updated);
  }

  markAllAsRead() {
    const updated = this.notifications().map(n => ({ ...n, isRead: true }));
    this.notifications.set(updated);
  }

  handleNotificationClick(notification: AppNotification) {
    if (!notification.isRead) {
      this.markAsRead(notification.id);
    }
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  // Métodos exclusivos para Docente
  openCreateModal() {
    this.isModalOpen.set(true);
  }

  closeCreateModal() {
    this.isModalOpen.set(false);
    this.newTitle.set('');
    this.newDescription.set('');
  }

  submitDocenteNotice() {
    const title = this.newTitle().trim();
    const desc = this.newDescription().trim();
    if (!title || !desc) {
      this.notificationService.showError('Completa el título y el mensaje del aviso.');
      return;
    }

    const newNotification: AppNotification = {
      id: Date.now(),
      type: 'docente',
      category: 'Docente',
      title: `${this.newCategory()}: ${title}`,
      description: `${this.authService.currentUser()?.name || 'Profesor'}: ${desc}`,
      timestamp: new Date(),
      isRead: false,
      courseTarget: this.newCourse()
    };

    this.notifications.update(list => [newNotification, ...list]);
    this.notificationService.showSuccess('Aviso enviado exitosamente a los alumnos del curso.');
    this.closeCreateModal();
  }
}
