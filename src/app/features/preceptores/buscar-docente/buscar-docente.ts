import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Teacher {
  id: number;
  status: 'Habilitado' | 'Deshabilitado';
  name: string;
  lastName: string;
  email: string;
  dni: string;
  contactInfo: string;
  appointment: 'Titular' | 'Suplente'; // Cargo en la institución
}

@Component({
  selector: 'app-buscar-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './buscar-docente.html',
  styleUrls: ['./buscar-docente.css']
})
export class BuscarDocenteComponent {
  // Datos mockeados de docentes
  teachers = signal<Teacher[]>([
    {
      id: 1,
      status: 'Habilitado',
      name: 'Carlos',
      lastName: 'Fernández',
      email: 'carlos.fernandez@eet3139.edu.ar',
      dni: '32111222',
      contactInfo: 'Materia: Matemáticas | Turno: Mañana',
      appointment: 'Titular'
    },
    {
      id: 2,
      status: 'Deshabilitado',
      name: 'María',
      lastName: 'García',
      email: 'maria.garcia@eet3139.edu.ar',
      dni: '33444555',
      contactInfo: 'Materia: Lengua | Turno: Tarde',
      appointment: 'Titular'
    },
    {
      id: 3,
      status: 'Habilitado',
      name: 'Jorge',
      lastName: 'López',
      email: 'jorge.lopez@eet3139.edu.ar',
      dni: '35666777',
      contactInfo: 'Materia: Informática | Turno: Mañana',
      appointment: 'Suplente'
    }
  ]);

  searchText = signal('');
  sortOrder = signal<'asc' | 'desc' | 'none'>('none');

  // Popovers
  isFilterOpen = signal(false);
  activeStatusPopoverId = signal<number | null>(null);
  selectedTeacher = signal<Teacher | null>(null);
  isEditModalOpen = signal(false);

  // Filtros Avanzados
  filterStatus = signal<'Todos' | 'Habilitado' | 'Deshabilitado'>('Todos');
  filterAppointment = signal<'Todos' | 'Titular' | 'Suplente'>('Todos');

  // Filtro general y ordenamiento
  filteredTeachers = computed(() => {
    let result = this.teachers();
    const search = this.searchText().toLowerCase();

    // Filtro de texto
    if (search) {
      result = result.filter(t => 
        t.name.toLowerCase().includes(search) ||
        t.lastName.toLowerCase().includes(search) ||
        t.dni.includes(search) ||
        t.email.toLowerCase().includes(search)
      );
    }

    // Filtros avanzados
    const status = this.filterStatus();
    if (status !== 'Todos') {
      result = result.filter(t => t.status === status);
    }

    const appointment = this.filterAppointment();
    if (appointment !== 'Todos') {
      result = result.filter(t => t.appointment === appointment);
    }

    // Ordenamiento A-Z
    const order = this.sortOrder();
    if (order !== 'none') {
      result = [...result].sort((a, b) => {
        const nameA = `${a.lastName} ${a.name}`.toLowerCase();
        const nameB = `${b.lastName} ${b.name}`.toLowerCase();
        if (order === 'asc') return nameA.localeCompare(nameB);
        return nameB.localeCompare(nameA);
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

  toggleFilter() {
    this.isFilterOpen.set(!this.isFilterOpen());
    this.activeStatusPopoverId.set(null);
  }

  toggleStatusPopover(teacherId: number, event: Event) {
    event.stopPropagation();
    if (this.activeStatusPopoverId() === teacherId) {
      this.activeStatusPopoverId.set(null);
    } else {
      this.activeStatusPopoverId.set(teacherId);
      this.isFilterOpen.set(false);
    }
  }

  closePopovers() {
    this.isFilterOpen.set(false);
    this.activeStatusPopoverId.set(null);
  }

  changeStatus(teacherId: number, newStatus: 'Habilitado' | 'Deshabilitado') {
    this.teachers.update(list => list.map(t => 
      t.id === teacherId ? { ...t, status: newStatus } : t
    ));
    this.activeStatusPopoverId.set(null);
  }

  clearFilters() {
    this.filterStatus.set('Todos');
    this.filterAppointment.set('Todos');
  }

  openEditModal(teacher: Teacher) {
    this.selectedTeacher.set(teacher);
    this.isEditModalOpen.set(true);
    this.closePopovers();
  }

  closeEditModal() {
    this.isEditModalOpen.set(false);
    this.selectedTeacher.set(null);
  }
}
