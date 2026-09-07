import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type NotificationType = 'message' | 'system';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones {
  
  notifications = signal<AppNotification[]>([
    {
      id: 1,
      type: 'message',
      title: 'Nuevo mensaje de Ana Martínez',
      description: 'Ana (Estudiante): "Profe, ¿podría revisar mi justificación de falta?"',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // Hace 5 min
      isRead: false,
      link: '/preceptores/informar'
    },
    {
      id: 2,
      type: 'system',
      title: 'Planillas actualizadas',
      description: 'El profesor Juan Carlos López ha subido las planillas de notas para el curso 4° 3° CS.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
      isRead: false
    },
    {
      id: 3,
      type: 'system',
      title: 'Aviso del Sistema',
      description: 'Mantenimiento programado para este sábado a las 23:00 hs.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hace 1 día
      isRead: true
    },
    {
      id: 4,
      type: 'message',
      title: 'Mensaje de Dirección',
      description: 'Directivo: "Por favor, acercar el registro de asistencia a secretaría."',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // Hace 2 días
      isRead: true,
      link: '/preceptores/informar'
    }
  ]);

  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  constructor(private router: Router) {}

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `hace ${diffMins} minutos`;
    if (diffHours < 24) return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 1) return `ayer a las ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    return `hace ${diffDays} días`;
  }

  formatExactDate(date: Date): string {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
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
    // Si no está leída, marcarla al hacer clic
    if (!notification.isRead) {
      this.markAsRead(notification.id);
    }

    // Redirección si tiene link (especialmente para mensajes)
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }
}
