import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CourseData {
  id: number;
  nombre: string;
  year?: string;
  division?: string;
  divisionNumber?: string;
  cycle?: 'basico' | 'superior';
  specialty: string;
  professor?: string;
  shift?: string;
}

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-card.html',
  styleUrls: ['./course-card.css']
})
export class CourseCardComponent {
  @Input({ required: true }) course!: CourseData;
  @Input() routePrefix: string = '/estudiantes/clases';

  get courseSubtitle(): string {
    const divisionStr = this.course.cycle === 'basico' ? 'Ciclo Básico' : 'Ciclo Superior';
    const num = this.course.division || this.course.divisionNumber;
    if (this.course.year && num) {
      return `${this.course.year}° ${num}° • ${divisionStr}`;
    }
    return divisionStr;
  }
}
