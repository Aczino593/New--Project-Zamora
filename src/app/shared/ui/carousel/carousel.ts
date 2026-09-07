import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.css']
})
export class CarouselComponent {
  newsList = signal([
    {
      id: 1,
      tag: 'Institucional',
      title: 'Reunión de Personal Docente',
      description: 'Se convoca a todos los preceptores a la reunión del viernes 20 a las 10:00 hs en Sala de Profesores.',
      bgClass: 'bg-primary',
      imageUrl: null
    },
    {
      id: 2,
      tag: 'Evento',
      title: 'Feria de Ciencias 2026',
      description: 'Invitamos a participar de la muestra anual de proyectos técnicos. Toca la imagen para ver el cronograma.',
      bgClass: 'bg-secondary',
      imageUrl: '/favicon.svg'
    }
  ]);
  
  currentIndex = signal(0);
  isModalOpen = signal(false);
  currentImage = signal<string | null>(null);
  
  next() {
    this.currentIndex.update(i => (i + 1) % this.newsList().length);
  }
  
  prev() {
    this.currentIndex.update(i => i === 0 ? this.newsList().length - 1 : i - 1);
  }

  openModal(imageUrl: string | null) {
    if (imageUrl) {
      this.currentImage.set(imageUrl);
      this.isModalOpen.set(true);
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.currentImage.set(null);
  }
}
