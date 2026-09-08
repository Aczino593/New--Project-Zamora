import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CoursesService } from '../../../core/services/courses.service';

@Component({
  selector: 'app-tutor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tutor-dashboard.html',
  styleUrls: ['./tutor-dashboard.css']
})
export class TutorDashboardComponent {
  public authService = inject(AuthService);
  private coursesService = inject(CoursesService);

  user = computed(() => this.authService.currentUser());
  courses = computed(() => this.coursesService.studentCourses());

  studentUnderCare = {
    name: 'Martina Rodríguez',
    course: '4° 3° CS',
    specialty: 'Informática',
    shift: 'Turno Mañana',
    attendancePercent: '94%',
    overallAverage: '8.80',
    observationsCount: 0
  };
}
