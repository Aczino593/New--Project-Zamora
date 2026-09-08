import { Component, Input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NewsSlide {
  id: number;
  tag: string;
  title: string;
  description: string;
  bgClass: string;
  imageUrl: string | null;
  category: 'EVENTO' | 'INSTITUCIONAL';
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.css']
})
export class CarouselComponent {
  @Input() categoryFilter?: 'EVENTO' | 'INSTITUCIONAL';

  allNews = signal<NewsSlide[]>([
    {
      id: 1,
      tag: 'Evento Escolar',
      title: 'Feria de Ciencias y Tecnología 2026',
      description: 'Invitamos a participar de la muestra anual de proyectos técnicos. Haz clic en la imagen para ver el cronograma de talleres y stands.',
      bgClass: 'bg-secondary',
      imageUrl: '/banner_cursos.webp',
      category: 'EVENTO'
    },
    {
      id: 2,
      tag: 'Deportes',
      title: 'Torneo Intercolegial de Fútbol y Vóley',
      description: 'Inscripciones abiertas para representar a tu división este sábado en el polideportivo escolar.',
      bgClass: 'bg-primary',
      imageUrl: null,
      category: 'EVENTO'
    },
    {
      id: 3,
      tag: 'Taller Especial',
      title: 'Hackathon Técnica Martín Miguel de Güemes',
      description: 'Jornada intensiva de programación y robótica para estudiantes del Ciclo Superior con entrega de certificados.',
      bgClass: 'bg-secondary',
      imageUrl: '/banner_cursos.webp',
      category: 'EVENTO'
    },
    {
      id: 4,
      tag: 'Institucional',
      title: 'Reunión de Personal Docente',
      description: 'Se convoca a todos los docentes y preceptores a la reunión general de coordinación este viernes a las 10:00 hs.',
      bgClass: 'bg-primary',
      imageUrl: null,
      category: 'INSTITUCIONAL'
    }
  ]);

  displayList = computed(() => {
    if (this.categoryFilter) {
      return this.allNews().filter(n => n.category === this.categoryFilter);
    }
    return this.allNews();
  });
  
  currentIndex = signal(0);
  isModalOpen = signal(false);
  currentImage = signal<string | null>(null);
  
  next() {
    const list = this.displayList();
    if (list.length > 0) {
      this.currentIndex.update(i => (i + 1) % list.length);
    }
  }
  
  prev() {
    const list = this.displayList();
    if (list.length > 0) {
      this.currentIndex.update(i => (i === 0 ? list.length - 1 : i - 1));
    }
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
