import { Component, signal, Inject, PLATFORM_ID, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';

type ConfigTab = 'cuenta' | 'titulo' | 'estilo';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.css']
})
export class ConfiguracionComponent {
  currentTab = signal<ConfigTab>('cuenta');
  isDarkMode = signal<boolean>(false);
  isBrowser = false;

  uploadedFile = signal<string | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: Object, @Inject(DOCUMENT) private document: Document) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      // Simplemente leer el estado actual del DOM para que el botón muestre lo correcto
      this.isDarkMode.set(this.document.body.classList.contains('dark-theme'));
    }
  }

  setTab(tab: ConfigTab) {
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
    }
  }

  removeFile() {
    this.uploadedFile.set(null);
  }
}
