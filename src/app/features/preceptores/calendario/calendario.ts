import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface CalendarEvent {
  id: number;
  date: string; // YYYY-MM-DD
  description: string;
  title?: string;
  type?: 'Examen' | 'Reunión' | 'Feriado' | 'Aviso';
  visibility: 'privado' | 'todos';
}

interface DayCell {
  dayNumber: number | null;
  dateStr: string | null;
  isToday: boolean;
  event: CalendarEvent | null;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario.html',
  styleUrls: ['./calendario.css']
})
export class CalendarioComponent {
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();
  
  viewDate = signal(new Date());
  selectedDate = signal<string | null>(null);
  
  formData = signal({
    title: '',
    description: '',
    type: 'Examen' as 'Examen' | 'Reunión' | 'Feriado' | 'Aviso',
    visibility: 'todos' as 'privado' | 'todos'
  });

  events = signal<CalendarEvent[]>([
    {
      id: 1,
      date: `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-20`,
      title: 'Examen Trimestral de Algoritmos',
      description: 'Fecha para la prueba de Algoritmos y Programación Web (4° 3° CS)',
      type: 'Examen',
      visibility: 'todos'
    },
    {
      id: 2,
      date: `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-25`,
      title: 'Cierre de Notas 1° Trimestre',
      description: 'Fecha límite para que los docentes completen planillas de regularidad.',
      type: 'Aviso',
      visibility: 'todos'
    }
  ]);

  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  currentMonthName = computed(() => this.monthNames[this.viewDate().getMonth()]);
  currentYearName = computed(() => this.viewDate().getFullYear());

  canGoPrev = computed(() => this.viewDate().getMonth() > 0);
  canGoNext = computed(() => this.viewDate().getMonth() < 11);

  get canEditEvents(): boolean {
    const role = this.authService.getRole();
    return role === 'docente' || role === 'preceptor' || role === 'admin';
  }

  calendarGrid = computed<DayCell[]>(() => {
    const d = this.viewDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: DayCell[] = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ dayNumber: null, dateStr: null, isToday: false, event: null });
    }

    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
      const event = this.events().find(e => e.date === dateStr) || null;

      grid.push({ dayNumber: i, dateStr, isToday, event });
    }

    const remaining = 42 - grid.length;
    for (let i = 0; i < remaining; i++) {
      grid.push({ dayNumber: null, dateStr: null, isToday: false, event: null });
    }

    return grid;
  });

  selectedEvent = computed(() => {
    const date = this.selectedDate();
    if (!date) return null;
    return this.events().find(e => e.date === date) || null;
  });

  constructor() {
    // Seleccionar por defecto el día de hoy
    const today = new Date();
    const defaultDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    this.selectDate(defaultDateStr);
  }

  prevMonth() {
    if (this.canGoPrev()) {
      const current = this.viewDate();
      this.viewDate.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    }
  }

  nextMonth() {
    if (this.canGoNext()) {
      const current = this.viewDate();
      this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }
  }

  selectDate(dateStr: string | null) {
    if (!dateStr) return;
    this.selectedDate.set(dateStr);
    
    const existing = this.events().find(e => e.date === dateStr);
    if (existing) {
      this.formData.set({
        title: existing.title || '',
        description: existing.description,
        type: existing.type || 'Examen',
        visibility: existing.visibility
      });
    } else {
      this.formData.set({
        title: '',
        description: '',
        type: 'Examen',
        visibility: 'todos'
      });
    }
  }

  saveEvent() {
    if (!this.canEditEvents) return;
    const date = this.selectedDate();
    if (!date) return;

    const desc = this.formData().description.trim();
    if (!desc) {
      this.notificationService.showError('Por favor ingresa una descripción para el evento o aviso.');
      return;
    }

    const currentEvents = [...this.events()];
    const existingIndex = currentEvents.findIndex(e => e.date === date);

    if (existingIndex >= 0) {
      currentEvents[existingIndex] = {
        ...currentEvents[existingIndex],
        title: this.formData().title || 'Aviso Escolar',
        description: desc,
        type: this.formData().type,
        visibility: this.formData().visibility
      };
    } else {
      currentEvents.push({
        id: Date.now(),
        date: date,
        title: this.formData().title || 'Fecha de Examen / Aviso',
        description: desc,
        type: this.formData().type,
        visibility: this.formData().visibility
      });
    }

    this.events.set(currentEvents);
    this.notificationService.showSuccess('Fecha o aviso agendado correctamente.');
  }

  deleteEvent() {
    if (!this.canEditEvents) return;
    const date = this.selectedDate();
    if (!date) return;

    this.events.set(this.events().filter(e => e.date !== date));
    this.formData.set({
      title: '',
      description: '',
      type: 'Examen',
      visibility: 'todos'
    });
    this.notificationService.showInfo('Aviso eliminado del calendario.');
  }

  formatDateFriendly(dateStr: string | null): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    
    return `${day} de ${this.monthNames[month]} ${year}`;
  }
}
