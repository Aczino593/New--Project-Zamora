import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CarouselComponent } from '../../../shared/ui/carousel/carousel';
import { CourseCardComponent } from '../../../shared/ui/course-card/course-card';
import { AuthService } from '../../../core/services/auth.service';
import { CoursesService } from '../../../core/services/courses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CarouselComponent, CourseCardComponent],
  templateUrl: './estudiante-dashboard.html',
  styleUrls: ['./estudiante-dashboard.css']
})
export class EstudianteDashboardComponent {
  public authService = inject(AuthService);
  private coursesService = inject(CoursesService);
  private notificationService = inject(NotificationService);

  user = computed(() => this.authService.currentUser());
  courses = computed(() => this.coursesService.studentCourses());

  // Modal para unirse a clase tipo Google Classroom
  isJoinModalOpen = signal(false);
  joinCodeInput = signal('');

  openJoinModal() {
    this.joinCodeInput.set('');
    this.isJoinModalOpen.set(true);
  }

  closeJoinModal() {
    this.isJoinModalOpen.set(false);
    this.joinCodeInput.set('');
  }

  confirmJoinCourse() {
    const code = this.joinCodeInput().trim();
    if (!code) {
      this.notificationService.showError('Por favor, ingresa el código o link provisto por Preceptoría.');
      return;
    }

    const result = this.coursesService.joinCourseByLinkOrCode(code, 'estudiante');
    if (result.success) {
      this.notificationService.showSuccess(result.message);
      this.closeJoinModal();
    } else {
      this.notificationService.showError(result.message);
    }
  }
}
