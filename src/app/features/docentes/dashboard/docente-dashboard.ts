import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseCardComponent } from '../../../shared/ui/course-card/course-card';
import { AuthService } from '../../../core/services/auth.service';
import { CoursesService } from '../../../core/services/courses.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Course } from '../../../core/models';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CourseCardComponent],
  templateUrl: './docente-dashboard.html',
  styleUrls: ['./docente-dashboard.css']
})
export class DocenteDashboardComponent {
  public authService = inject(AuthService);
  private coursesService = inject(CoursesService);
  private notificationService = inject(NotificationService);

  user = computed(() => this.authService.currentUser());
  courses = computed(() => this.coursesService.teacherCourses());

  // Modal para vincular materia de preceptoría
  isLinkModalOpen = signal(false);
  teacherLinkInput = signal('');

  openLinkModal() {
    this.teacherLinkInput.set('');
    this.isLinkModalOpen.set(true);
  }

  closeLinkModal() {
    this.isLinkModalOpen.set(false);
    this.teacherLinkInput.set('');
  }

  confirmBindCourse() {
    const linkOrCode = this.teacherLinkInput().trim();
    if (!linkOrCode) {
      this.notificationService.showError('Por favor, ingresa el link de docente generado por Preceptoría.');
      return;
    }

    const result = this.coursesService.joinCourseByLinkOrCode(linkOrCode, 'docente');
    if (result.success) {
      this.notificationService.showSuccess(result.message);
      this.closeLinkModal();
    } else {
      this.notificationService.showError(result.message);
    }
  }
}
