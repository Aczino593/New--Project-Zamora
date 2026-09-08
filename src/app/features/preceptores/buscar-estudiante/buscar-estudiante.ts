import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type StudentStatus = 'En orden' | 'Repitente';

export interface Observation {
  date: string;
  reason: string;
}

export interface DetailedStudent {
  id: number;
  name: string;
  lastName: string;
  dni: string;
  email: string;
  status: StudentStatus;
  course: string;
  turno: string;
  categoria: string;
  phone: string;
  address: string;
  birthDate: string;
  tutorName: string;
  observations: Observation[];
}

@Component({
  selector: 'app-buscar-estudiante',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-estudiante.html',
  styleUrls: ['./buscar-estudiante.css']
})
export class BuscarEstudianteComponent {
  
  searchQuery = signal('');
  
  // Filtros Avanzados
  isFilterOpen = signal(false);
  filterCourse = signal('');
  filterTurno = signal('');
  filterCategoria = signal('');
  sortOrder = signal<'asc' | 'desc' | 'none'>('none');

  // Modales y Popovers
  activeStatusPopoverId = signal<number | null>(null);
  selectedStudentForObs = signal<DetailedStudent | null>(null);
  selectedStudentForDetails = signal<DetailedStudent | null>(null);

  // Mock Data
  allStudents = signal<DetailedStudent[]>([
    {
      id: 1, name: 'Juan Ignacio', lastName: 'Pérez', dni: '45678123', email: 'juan.perez@alumno.edu.ar',
      status: 'En orden', course: '4° 3°', turno: 'Mañana', categoria: 'Ciclo Superior',
      phone: '+54 387 111-2222', address: 'Caseros 123, Salta', birthDate: '10/05/2008', tutorName: 'María de Pérez',
      observations: [
        { date: '15/04/2026', reason: 'Amonestación por uso indebido del taller de informática.' }
      ]
    },
    {
      id: 2, name: 'Lucía', lastName: 'Gómez', dni: '46777888', email: 'lucia.gomez@alumno.edu.ar',
      status: 'Repitente', course: '4° 3°', turno: 'Tarde', categoria: 'Ciclo Superior',
      phone: '+54 387 333-4444', address: 'Belgrano 456, Salta', birthDate: '22/11/2007', tutorName: 'Carlos Gómez',
      observations: [
        { date: '10/03/2026', reason: 'Falta de respeto a un preceptor durante el recreo.' }
      ]
    },
    {
      id: 3, name: 'Sofía', lastName: 'Martínez', dni: '47888999', email: 'sofia.mtz@alumno.edu.ar',
      status: 'En orden', course: '1° 1°', turno: 'Mañana', categoria: 'Ciclo Básico',
      phone: '+54 387 555-6666', address: 'Alberdi 789, Salta', birthDate: '20/09/2011', tutorName: 'José Martínez',
      observations: []
    }
  ]);

  filteredStudents = computed(() => {
    let result = this.allStudents();

    // Filtro de Texto (Universal)
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.lastName.toLowerCase().includes(q) || 
        s.dni.includes(q) || 
        s.email.toLowerCase().includes(q)
      );
    }

    // Filtros Avanzados
    const fCourse = this.filterCourse();
    if (fCourse) result = result.filter(s => s.course === fCourse);

    const fTurno = this.filterTurno();
    if (fTurno) result = result.filter(s => s.turno === fTurno);

    const fCat = this.filterCategoria();
    if (fCat) result = result.filter(s => s.categoria === fCat);

    // Ordenamiento por Nombre y Apellido
    const order = this.sortOrder();
    if (order !== 'none') {
      result = result.slice().sort((a, b) => {
        const nameA = `${a.lastName} ${a.name}`.toLowerCase();
        const nameB = `${b.lastName} ${b.name}`.toLowerCase();
        if (nameA < nameB) return order === 'asc' ? -1 : 1;
        if (nameA > nameB) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });

  toggleSort() {
    const current = this.sortOrder();
    if (current === 'none') this.sortOrder.set('asc');
    else if (current === 'asc') this.sortOrder.set('desc');
    else this.sortOrder.set('none');
  }

  // Unique lists for filter dropdowns
  uniqueCourses = computed(() => [...new Set(this.allStudents().map(s => s.course))]);
  uniqueTurnos = computed(() => [...new Set(this.allStudents().map(s => s.turno))]);
  uniqueCategorias = computed(() => [...new Set(this.allStudents().map(s => s.categoria))]);

  toggleFilter(event: Event) {
    event.stopPropagation();
    this.isFilterOpen.set(!this.isFilterOpen());
    this.closePopover();
  }

  clearFilters() {
    this.filterCourse.set('');
    this.filterTurno.set('');
    this.filterCategoria.set('');
    this.searchQuery.set('');
  }

  // Acciones de UI
  toggleStatusPopover(id: number, event: Event) {
    event.stopPropagation();
    this.isFilterOpen.set(false);
    if (this.activeStatusPopoverId() === id) {
      this.activeStatusPopoverId.set(null);
    } else {
      this.activeStatusPopoverId.set(id);
    }
  }

  closeAllPopups() {
    this.activeStatusPopoverId.set(null);
    this.isFilterOpen.set(false);
  }

  closePopover() {
    this.activeStatusPopoverId.set(null);
  }

  openObservations(student: DetailedStudent) {
    this.selectedStudentForObs.set(student);
    this.closeAllPopups();
  }

  closeObservations() {
    this.selectedStudentForObs.set(null);
  }

  openDetails(student: DetailedStudent) {
    this.selectedStudentForDetails.set(student);
    this.closeAllPopups();
  }

  closeDetails() {
    this.selectedStudentForDetails.set(null);
  }
}
