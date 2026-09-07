import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CourseData {
  id: number;
  nombre: string;
  year: string;
  division: string;
  cycle: 'basico' | 'superior';
  specialty: string;
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
}
