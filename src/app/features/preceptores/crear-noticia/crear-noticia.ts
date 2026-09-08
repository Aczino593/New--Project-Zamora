import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TabType = 'redactar' | 'historial';
type NewsType = 'INSTITUCIONAL' | 'EVENTO';

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  type: NewsType;
  isActive: boolean;
  date: string;
}

@Component({
  selector: 'app-crear-noticia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-noticia.html',
  styleUrls: ['./crear-noticia.css']
})
export class CrearNoticiaComponent {
  currentTab = signal<TabType>('redactar');

  // Formulario Redactar
  formData = signal({
    title: '',
    description: '',
    type: 'INSTITUCIONAL' as NewsType,
    imagePreview: null as string | null
  });

  // Base de datos simulada de noticias
  newsList = signal<NewsItem[]>([
    {
      id: 1,
      title: 'Reunión de Personal Docente',
      description: 'Se convoca a todos los preceptores a la reunión del viernes 20 a las 10:00 hs en Sala de Profesores.',
      image: null,
      type: 'INSTITUCIONAL',
      isActive: true,
      date: '2026-08-20'
    },
    {
      id: 2,
      title: 'Torneo Intercolegial de Fútbol',
      description: 'Participa con tu curso este sábado en el polideportivo.',
      image: null,
      type: 'EVENTO',
      isActive: false,
      date: '2026-08-15'
    }
  ]);

  // Modales
  imagePreviewModalUrl = signal<string | null>(null);
  
  // Estado de Creación (Animación)
  creationState = signal<'idle' | 'loading' | 'success'>('idle');

  // Edición
  editingNews = signal<NewsItem | null>(null);

  setTab(tab: TabType) {
    this.currentTab.set(tab);
  }

  onImageSelected(event: any, isEditing: boolean = false) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (isEditing) {
          const current = this.editingNews();
          if (current) this.editingNews.set({ ...current, image: e.target.result });
        } else {
          this.formData.set({ ...this.formData(), imagePreview: e.target.result });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(isEditing: boolean = false) {
    if (isEditing) {
      const current = this.editingNews();
      if (current) this.editingNews.set({ ...current, image: null });
    } else {
      this.formData.set({ ...this.formData(), imagePreview: null });
    }
  }

  openImagePreview(url: string | null) {
    if (url) {
      this.imagePreviewModalUrl.set(url);
    }
  }

  closeImagePreview() {
    this.imagePreviewModalUrl.set(null);
  }

  canPublish = computed(() => {
    return this.formData().title.trim().length > 0;
  });

  publishNews() {
    if (!this.canPublish()) return;

    // Mostrar modal de carga
    this.creationState.set('loading');

    // Simular tiempo de carga de 1.5 segundos
    setTimeout(() => {
      const form = this.formData();
      const newNews: NewsItem = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        type: form.type,
        image: form.imagePreview,
        isActive: true,
        date: new Date().toISOString().split('T')[0]
      };

      this.newsList.set([newNews, ...this.newsList()]);
      
      // Limpiar formulario
      this.formData.set({
        title: '',
        description: '',
        type: 'INSTITUCIONAL',
        imagePreview: null
      });

      this.creationState.set('success');

      // Cerrar modal de éxito automáticamente después de 2 segundos
      setTimeout(() => {
        this.creationState.set('idle');
        this.setTab('historial'); // Llevar al usuario a ver su noticia
      }, 2000);
      
    }, 1500);
  }

  toggleStatus(id: number) {
    const updated = this.newsList().map(n => 
      n.id === id ? { ...n, isActive: !n.isActive } : n
    );
    this.newsList.set(updated);
  }

  openEditModal(item: NewsItem) {
    // Clonar para no editar directamente la referencia
    this.editingNews.set({ ...item });
  }

  closeEditModal() {
    this.editingNews.set(null);
  }

  saveEdit() {
    const edited = this.editingNews();
    if (!edited || edited.title.trim().length === 0) return;

    const updated = this.newsList().map(n => 
      n.id === edited.id ? edited : n
    );
    this.newsList.set(updated);
    this.closeEditModal();
  }
}
