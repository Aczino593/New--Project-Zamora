import { Injectable, signal, computed } from '@angular/core';
import { UserProfile, UserRole } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Estado reactivo moderno con Signals (Angular 21)
  readonly currentUser = signal<UserProfile | null>(null);

  // Perfiles predefinidos para mock data según el rol
  private readonly mockProfiles: Record<UserRole, UserProfile> = {
    estudiante: {
      id: 1,
      name: 'Martina Rodríguez',
      email: 'martina.rodriguez@alumno.edu.ar',
      dni: '45678912',
      role: 'estudiante',
      avatar: 'https://i.pravatar.cc/150?u=martina',
      isDelegado: true, // Habilitado por defecto como Delegado para facilitar pruebas según PDF
      delegadoRole: 'Delegado',
      gender: 'Femenino',
      birthYear: '2008',
      location: 'Salta Capital',
      address: 'Av. San Martín 1234',
      specialty: 'Informática',
      phone: '387-4123456',
      course: '4° 3° CS',
      turno: 'Mañana',
      tutorName: 'Carlos Rodríguez'
    },
    docente: {
      id: 2,
      name: 'Prof. Carlos Fernández',
      email: 'carlos.fernandez@eet3139.edu.ar',
      dni: '32111222',
      role: 'docente',
      avatar: 'https://i.pravatar.cc/150?u=carlosf',
      isDelegado: false,
      gender: 'Masculino',
      birthYear: '1980',
      location: 'Salta Capital',
      address: 'Belgrano 456',
      specialty: 'Informática / Matemáticas',
      phone: '387-4556677'
    },
    tutor: {
      id: 3,
      name: 'Carlos Rodríguez',
      email: 'carlos.tutor@gmail.com',
      dni: '24111333',
      role: 'tutor',
      avatar: 'https://i.pravatar.cc/150?u=carlostutor',
      isDelegado: false,
      gender: 'Masculino',
      birthYear: '1975',
      location: 'Salta Capital',
      address: 'Av. San Martín 1234',
      specialty: 'Comercio',
      phone: '387-4998877',
      studentUnderCare: 'Martina Rodríguez (4° 3° CS)'
    },
    preceptor: {
      id: 4,
      name: 'José Pérez',
      email: 'preceptor@eet3139.edu.ar',
      dni: '20123456',
      role: 'preceptor',
      avatar: 'https://i.pravatar.cc/150?u=joseperez',
      isDelegado: false,
      gender: 'Masculino',
      birthYear: '1985',
      location: 'Salta Capital',
      address: 'Av. San Martín 1234',
      specialty: 'Preceptoría',
      phone: '387-4123456'
    },
    admin: {
      id: 5,
      name: 'Ana Martínez',
      email: 'admin@eet3139.edu.ar',
      dni: '28999888',
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?u=anamartinez',
      isDelegado: false,
      gender: 'Femenino',
      birthYear: '1982',
      location: 'Salta Capital',
      address: 'Mitre 789',
      specialty: 'Secretaría / Dirección',
      phone: '387-4889900'
    }
  };

  constructor() {
    // Si ya existe sesión guardada en memoria o recarga de desarrollo
    const savedRole = localStorage.getItem('user_role') as UserRole | null;
    if (savedRole && this.mockProfiles[savedRole]) {
      this.login('', savedRole);
    }
  }

  login(dni: string, role: string): void {
    const userRole = (role?.toLowerCase() as UserRole) || 'estudiante';
    const profile = this.mockProfiles[userRole] || {
      id: Date.now(),
      name: 'Usuario Institucional',
      email: `${userRole}@eet3139.edu.ar`,
      dni: dni || '12345678',
      role: userRole,
      avatar: 'https://i.pravatar.cc/150?u=default'
    };

    this.currentUser.set({ ...profile });
    localStorage.setItem('user_role', userRole);
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('user_role');
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  getRole(): string | null {
    return this.currentUser()?.role || null;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUser();
  }

  isDelegado(): boolean {
    const user = this.currentUser();
    return !!(user && user.role === 'estudiante' && user.isDelegado);
  }

  toggleDelegadoStatus(): void {
    const user = this.currentUser();
    if (user && user.role === 'estudiante') {
      const nextStatus = !user.isDelegado;
      this.currentUser.set({
        ...user,
        isDelegado: nextStatus,
        delegadoRole: nextStatus ? 'Delegado' : 'Ninguno'
      });
    }
  }
}
