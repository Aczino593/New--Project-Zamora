import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselComponent } from '../../../shared/ui/carousel/carousel';
import { CourseCardComponent, CourseData } from '../../../shared/ui/course-card/course-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CarouselComponent, CourseCardComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  preceptorName = 'José Pérez';
  
  allCourses = signal<CourseData[]>([
    { id: 1, nombre: '4°3° CS', specialty: 'Informática', year: '4', division: '3', cycle: 'superior' },
    { id: 2, nombre: 'Autogestión Aplicada', specialty: 'Automotor', year: '5', division: '1', cycle: 'superior' },
    { id: 3, nombre: 'AAT 26', specialty: 'Informática', year: '4', division: '2', cycle: 'superior' },
    { id: 4, nombre: 'Mantenimiento de Software', specialty: 'Informática', year: '5', division: '2', cycle: 'superior' },
    { id: 5, nombre: '3ro 3ra CS_TM', specialty: 'Automotor', year: '3', division: '3', cycle: 'superior' },
    { id: 6, nombre: '1ro 1ra CB', specialty: 'Básico General', year: '1', division: '1', cycle: 'basico' },
    { id: 7, nombre: '2do 2da CB', specialty: 'Básico General', year: '2', division: '2', cycle: 'basico' },
  ]);

  selectedCycle = signal<'todos' | 'basico' | 'superior'>('todos');
  selectedYear = signal<string>('todos');

  availableYears = computed(() => {
    const cycle = this.selectedCycle();
    if (cycle === 'basico') return ['1', '2'];
    if (cycle === 'superior') return ['3', '4', '5', '6', '7'];
    return ['1', '2', '3', '4', '5', '6', '7'];
  });

  filteredCourses = computed(() => {
    let courses = this.allCourses();
    
    if (this.selectedCycle() !== 'todos') {
      courses = courses.filter(c => c.cycle === this.selectedCycle());
    }
    
    if (this.selectedYear() !== 'todos') {
      courses = courses.filter(c => c.year === this.selectedYear());
    }
    
    return courses;
  });

  setCycleFilter(cycle: 'todos' | 'basico' | 'superior') {
    this.selectedCycle.set(cycle);
    if (this.selectedYear() !== 'todos' && !this.availableYears().includes(this.selectedYear())) {
      this.selectedYear.set('todos');
    }
  }

  setYearFilter(year: string) {
    if (this.selectedYear() === year) {
      this.selectedYear.set('todos');
    } else {
      this.selectedYear.set(year);
    }
  }
}
