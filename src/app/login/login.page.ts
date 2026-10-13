import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput,
  IonButton, IonIcon, IonSpinner, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ApiService } from '../services/api';
 
// Claves para recordar la IP y el correo en el teléfono
const KEY_IP = 'login_ip';
const KEY_CORREO = 'login_correo';
 
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput,
    IonButton, IonIcon, IonSpinner
  ],
})
export class LoginPage {
  usuario = { correo: '', contra: '' };
  ipServidor = '';
  verContra = false;
  cargando = false;
  mensajeError = '';
 
  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
 
    // Si ya inició sesión antes, se rellenan la IP y el correo automáticamente
    this.ipServidor = this.leer(KEY_IP) || this.api.ip || '';
    this.usuario.correo = this.leer(KEY_CORREO);
  }
 
  login(): void {
    if (this.cargando) return; // evita doble envío
    this.mensajeError = '';
 
    const ip = this.ipServidor.trim();
    const correo = this.usuario.correo.trim();
    const contra = this.usuario.contra;
 
    // Validaciones antes de llamar al servidor
    if (!ip) {
      this.mensajeError = 'Ingresa la IP del servidor.';
      return;
    }
    if (!correo || !contra) {
      this.mensajeError = 'Llena correo y contraseña.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      this.mensajeError = 'Ingresa un correo válido.';
      return;
    }
 
    this.api.ip = ip;
    const url = this.api.url('api_ionic/login.php');
    this.cargando = true;
 
    this.http.post<{ success: boolean; message?: string }>(url, { correo, contra })
      .pipe(timeout(10000)) // si el servidor no responde en 10 s, se cancela
      .subscribe({
        next: (res) => {
          this.cargando = false;
 
          if (res?.success) {
            this.guardar(KEY_IP, ip);
            this.guardar(KEY_CORREO, correo);
            this.usuario.contra = '';
            this.mostrarToast('¡Bienvenido!');
            this.router.navigateByUrl('/home', { replaceUrl: true });
          } else {
            this.mensajeError = res?.message || 'Correo o contraseña incorrectos.';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error en login:', err);
          this.cargando = false;
          this.mensajeError = this.traducirError(err);
          this.cdr.detectChanges();
        },
      });
  }
 
  // Lleva al formulario de registro conservando la IP escrita
  irARegistro(): void {
    const ip = this.ipServidor.trim();
    if (ip) {
      this.api.ip = ip;
      this.guardar(KEY_IP, ip);
    }
    this.router.navigateByUrl('/registro');
  }
 
  // Convierte los errores técnicos en mensajes entendibles
  private traducirError(err: any): string {
    if (err?.name === 'TimeoutError') {
      return 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
    }
    if (err?.status === 0) {
      return 'No se pudo conectar con el servidor. Verifica la IP y que el teléfono esté en la misma red Wi-Fi.';
    }
    if (err?.status === 404) {
      return 'No se encontró login.php en el servidor. Revisa la ruta de la API.';
    }
    return err?.error?.message || `Error del servidor (código ${err?.status}).`;
  }
 
  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2500, position: 'bottom' });
    toast.present();
  }
 
  private leer(clave: string): string {
    try { return localStorage.getItem(clave) || ''; } catch { return ''; }
  }
 
  private guardar(clave: string, valor: string): void {
    try { localStorage.setItem(clave, valor); } catch { /* sin almacenamiento disponible */ }
  }
}