import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  get ip(): string {
    return localStorage.getItem('ipServidor') || 'localhost';
  }
  set ip(valor: string) {
    localStorage.setItem('ipServidor', valor.trim());
  }
  // Ej: url('api_ionic/login.php') -> http://192.168.1.75/api_ionic/login.php
  url(ruta: string): string {
    return `http://${this.ip}/${ruta}`;
  }
}