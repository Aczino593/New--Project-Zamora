import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simulación simple para mantener el estado. 
  // Más adelante esto se conectará al Backend real con tokens JWT.
  private currentUserRole: string | null = null;
  private isAuthenticated = false;

  constructor() { }

  login(dni: string, role: string): void {
    // Aquí iría la llamada HTTP real
    this.isAuthenticated = true;
    this.currentUserRole = role;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.currentUserRole = null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }

  getRole(): string | null {
    return this.currentUserRole;
  }
}
