import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CalendarEvent {
  id: number;
  date: string; // YYYY-MM-DD
  description: string;
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
  // Estado actual del calendario
  currentYear = new Date().getFullYear();
  
  // Signals
  viewDate = signal(new Date()); // Controla qué mes estamos viendo
  selectedDate = signal<string | null>(null); // Fecha seleccionada (YYYY-MM-DD)
  
  // Formularios
  formData = signal({
    description: '',
    visibility: 'privado' as 'privado' | 'todos'
  });

  // Base de datos simulada de eventos
  events = signal<CalendarEvent[]>([
    {
      id: 1,
      date: `${this.currentYear}-08-20`,
      description: 'Reunión de personal docente',
      visibility: 'todos'
    },
    {
      id: 2,
      date: `${this.currentYear}-08-25`,
      description: 'Cargar asistencias del 3ro 3ra',
      visibility: 'privado'
    }
  ]);

  // Nombres para la vista
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Propiedades calculadas
  currentMonthName = computed(() => this.monthNames[this.viewDate().getMonth()]);
  currentYearName = computed(() => this.viewDate().getFullYear());

  canGoPrev = computed(() => this.viewDate().getMonth() > 0);
  canGoNext = computed(() => this.viewDate().getMonth() < 11);

  // Calcula la cuadrícula del mes actual
  calendarGrid = computed<DayCell[]>(() => {
    const d = this.viewDate();
    const year = d.getFullYear();
    const month = d.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0-6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: DayCell[] = [];
    
    // Celdas vacías previas
    for (let i = 0; i < firstDayIndex; i++) {
      grid.push({ dayNumber: null, dateStr: null, isToday: false, event: null });
    }

    const today = new Date();

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
      const event = this.events().find(e => e.date === dateStr) || null;

      grid.push({ dayNumber: i, dateStr, isToday, event });
    }

    // Celdas vacías posteriores (opcional para mantener el grid uniforme de 6 semanas)
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

  // Métodos de Navegación
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

  // Interacción
  selectDate(dateStr: string | null) {
    if (!dateStr) return;
    
    // Verificar si no es una fecha caducada (opcional: el usuario dijo "no se puede agendar para fecha caducada", lo limitaremos en la lógica de guardado o bloqueando la selección de fechas pasadas, pero por ahora solo el año está bloqueado por el canGoPrev/Next).
    
    this.selectedDate.set(dateStr);
    
    // Si hay evento, poblar el formulario para editar
    const existingEvent = this.events().find(e => e.date === dateStr);
    if (existingEvent) {
      this.formData.set({
        description: existingEvent.description,
        visibility: existingEvent.visibility
      });
    } else {
      this.formData.set({
        description: '',
        visibility: 'privado'
      });
    }
  }

  saveEvent() {
    const date = this.selectedDate();
    if (!date) return;

    const desc = this.formData().description.trim();
    if (!desc) return;

    // Actualizar o crear
    const currentEvents = [...this.events()];
    const existingIndex = currentEvents.findIndex(e => e.date === date);

    if (existingIndex >= 0) {
      currentEvents[existingIndex].description = desc;
      currentEvents[existingIndex].visibility = this.formData().visibility;
    } else {
      currentEvents.push({
        id: Date.now(),
        date: date,
        description: desc,
        visibility: this.formData().visibility
      });
    }

    this.events.set(currentEvents);
    
    // Opcional: mostrar un mensaje de éxito
    alert('Evento guardado exitosamente.');
  }

  deleteEvent() {
    const date = this.selectedDate();
    if (!date) return;

    const currentEvents = this.events().filter(e => e.date !== date);
    this.events.set(currentEvents);
    
    this.formData.set({
      description: '',
      visibility: 'privado'
    });
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
