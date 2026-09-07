import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Utilizamos Signals (lo más moderno en Angular 21) para el estado global
  readonly toast = signal<ToastMessage | null>(null);

  showSuccess(message: string) {
    this.show({ message, type: 'success' });
  }

  showError(message: string) {
    this.show({ message, type: 'error' });
  }

  showInfo(message: string) {
    this.show({ message, type: 'info' });
  }

  private show(toastMessage: ToastMessage) {
    this.toast.set(toastMessage);
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      this.clear();
    }, 3000);
  }

  clear() {
    this.toast.set(null);
  }
}
