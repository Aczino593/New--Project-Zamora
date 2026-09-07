import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type ViewMode = 'list' | 'chat';

interface User {
  id: number;
  name: string;
  dni: string;
  role: string;
  avatar: string;
}

interface Message {
  id: number;
  text: string;
  timestamp: Date;
  isMine: boolean;
}

interface ChatSession {
  id: number;
  user: User;
  messages: Message[];
  lastUpdated: Date;
}

@Component({
  selector: 'app-informar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './informar.html',
  styleUrls: ['./informar.css']
})
export class InformarComponent {
  
  viewMode = signal<ViewMode>('list');
  
  // Base de datos de usuarios (simulada)
  allUsers: User[] = [
    { id: 101, name: 'María Gómez', dni: '32145678', role: 'Directivo', avatar: 'https://i.pravatar.cc/150?u=101' },
    { id: 102, name: 'Juan Carlos López', dni: '45678912', role: 'Docente', avatar: 'https://i.pravatar.cc/150?u=102' },
    { id: 103, name: 'Ana Martínez', dni: '48999123', role: 'Estudiante', avatar: 'https://i.pravatar.cc/150?u=103' },
    { id: 104, name: 'Pedro Sánchez', dni: '49222333', role: 'Estudiante', avatar: 'https://i.pravatar.cc/150?u=104' },
    { id: 105, name: 'Laura Torres', dni: '29888777', role: 'Docente', avatar: 'https://i.pravatar.cc/150?u=105' }
  ];

  // Búsqueda
  searchQuery = signal('');
  
  searchResults = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    return this.allUsers.filter(u => 
      u.name.toLowerCase().includes(q) || u.dni.includes(q)
    );
  });

  // Chats Activos
  chats = signal<ChatSession[]>([
    {
      id: 1,
      user: this.allUsers[1],
      messages: [
        { id: 1, text: 'Hola, ¿pudiste revisar las planillas del 4to 3ra?', timestamp: new Date(Date.now() - 3600000), isMine: true },
        { id: 2, text: 'Sí, ya están cargadas en el sistema.', timestamp: new Date(Date.now() - 3000000), isMine: false }
      ],
      lastUpdated: new Date(Date.now() - 3000000)
    }
  ]);

  activeChat = signal<ChatSession | null>(null);
  newMessageText = signal('');

  // Ordenar chats por última actualización
  sortedChats = computed(() => {
    return [...this.chats()].sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
  });

  // Métodos
  startChatWithUser(user: User) {
    // Limpiar búsqueda
    this.searchQuery.set('');
    
    // Verificar si ya existe un chat
    let existingChat = this.chats().find(c => c.user.id === user.id);
    
    if (!existingChat) {
      existingChat = {
        id: Date.now(),
        user: user,
        messages: [],
        lastUpdated: new Date()
      };
      this.chats.set([existingChat, ...this.chats()]);
    }

    this.activeChat.set(existingChat);
    this.viewMode.set('chat');
    this.scrollToBottom();
  }

  openChat(chat: ChatSession) {
    this.activeChat.set(chat);
    this.viewMode.set('chat');
    this.scrollToBottom();
  }

  goBack() {
    this.activeChat.set(null);
    this.viewMode.set('list');
  }

  sendMessage() {
    const text = this.newMessageText().trim();
    const chat = this.activeChat();
    
    if (!text || !chat) return;

    const newMsg: Message = {
      id: Date.now(),
      text: text,
      timestamp: new Date(),
      isMine: true
    };

    // Actualizar el chat activo
    const updatedChat = {
      ...chat,
      messages: [...chat.messages, newMsg],
      lastUpdated: new Date()
    };

    this.activeChat.set(updatedChat);

    // Actualizar la lista global
    const updatedChats = this.chats().map(c => 
      c.id === chat.id ? updatedChat : c
    );
    this.chats.set(updatedChats);

    this.newMessageText.set('');
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const container = document.getElementById('chat-messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 50);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }
}
