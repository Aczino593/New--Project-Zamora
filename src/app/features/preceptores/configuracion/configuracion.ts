import { Component, signal, Inject, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

type ConfigTab = 'cuenta' | 'titulo' | 'estilo';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent {
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  currentTab = signal<ConfigTab>('cuenta');
  isDarkMode = signal<boolean>(false);
  isBrowser = false;

  uploadedFile = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: Object, @Inject(DOCUMENT) private document: Document) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.isDarkMode.set(this.document.body.classList.contains('dark-theme'));
    }
  }

  get isDocente(): boolean {
    return this.authService.getRole() === 'docente';
  }

  setTab(tab: ConfigTab) {
    // Protección para pestaña de título
    if (tab === 'titulo' && !this.isDocente) {
      return;
    }
    this.currentTab.set(tab);
  }

  setTheme(dark: boolean) {
    if (!this.isBrowser) return;
    
    this.isDarkMode.set(dark);
    if (dark) {
      this.document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      this.document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedFile.set(file.name);
      this.notificationService.showSuccess(`Archivo "${file.name}" cargado.`);
    }
  }

  removeFile() {
    this.uploadedFile.set(null);
  }

  confirmUpload() {
    this.notificationService.showSuccess('Título profesional enviado y registrado en legajo.');
  }
}
