import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type RoleType = 'Ninguno' | 'Delegado' | 'Subdelegado';

export interface Student {
  id: number;
  name: string;
  dni: string;
  course: string;
  role: RoleType;
  // Mock extra data para el resumen
  address: string;
  phone: string;
  email: string;
  birthDate: string;
  tutorName: string;
}

@Component({
  selector: 'app-designar-rango',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designar-rango.html',
  styleUrls: ['./designar-rango.css']
})
export class DesignarRango {
  
  viewMode = signal<'search' | 'edit'>('search');
  searchQuery = signal('');
  selectedStudent = signal<Student | null>(null);

  // Mock Database
  students = signal<Student[]>([
    {
      id: 1, name: 'Martina Rodríguez', dni: '45678912', course: '4° 3° CS', role: 'Ninguno',
      address: 'San Martín 1234, Salta Capital', phone: '+54 387 123-4567', email: 'martina.r@gmail.com', birthDate: '15 May 2008', tutorName: 'Carlos Rodríguez'
    },
    {
      id: 2, name: 'Lucas González', dni: '46777888', course: '4° 3° CS', role: 'Delegado',
      address: 'Belgrano 456, Salta Capital', phone: '+54 387 987-6543', email: 'lucas.g@hotmail.com', birthDate: '02 Feb 2008', tutorName: 'María González'
    },
    {
      id: 3, name: 'Sofía Martínez', dni: '47888999', course: '1ro 1ra CB', role: 'Subdelegado',
      address: 'Alberdi 789, Salta Capital', phone: '+54 387 555-1122', email: 'sofia.mtz@gmail.com', birthDate: '20 Sep 2011', tutorName: 'Juan Martínez'
    }
  ]);

  filteredStudents = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return []; // Solo muestra si hay búsqueda
    
    return this.students().filter(s => 
      s.name.toLowerCase().includes(q) || s.dni.includes(q)
    );
  });

  editStudent(student: Student) {
    // Clonamos para no editar directamente hasta guardar
    this.selectedStudent.set({ ...student });
    this.viewMode.set('edit');
  }

  goBack() {
    this.selectedStudent.set(null);
    this.viewMode.set('search');
  }

  saveRole() {
    const edited = this.selectedStudent();
    if (!edited) return;

    // Actualizamos la BD
    const updatedList = this.students().map(s => 
      s.id === edited.id ? edited : s
    );
    this.students.set(updatedList);
    
    // Regresamos
    this.goBack();
  }
}
