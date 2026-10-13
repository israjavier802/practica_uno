import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import {
  IonButton, IonButtons, IonBackButton, IonContent, IonHeader, IonIcon,
  IonInput, IonItem, IonList, IonSpinner, IonTitle, IonToolbar, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ApiService } from '../services/api';
 
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
    IonButton, IonIcon, IonList, IonItem, IonInput, IonSpinner
  ]
})
export class RegistroPage {
  usuario = {
    nombre: '',
    matricula: '',
    correo: '',
    contra: ''
  };
  confirmarContra = '';
 
  verContra = false;
  mensajeError = '';
  guardando = false;
 
  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private api: ApiService,
    private toastCtrl: ToastController
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
  }
 
  guardarDatos(): void {
    if (this.guardando) return;
    this.mensajeError = '';
 
    const alumno = {
      nombre: this.usuario.nombre.trim(),
      matricula: this.usuario.matricula.trim(),
      correo: this.usuario.correo.trim(),
      contra: this.usuario.contra
    };
 
    // Validaciones
    if (!alumno.nombre || !alumno.matricula || !alumno.correo || !alumno.contra) {
      this.mensajeError = 'Completa todos los campos.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alumno.correo)) {
      this.mensajeError = 'Ingresa un correo válido.';
      return;
    }
    if (alumno.contra.length < 6) {
      this.mensajeError = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (alumno.contra !== this.confirmarContra) {
      this.mensajeError = 'Las contraseñas no coinciden.';
      return;
    }
 
    this.guardando = true;
    const urlAPI = this.api.url('api_ionic/registro.php');
 
    this.http.post<{ status: string; mensaje: string }>(urlAPI, alumno)
      .pipe(timeout(10000))
      .subscribe({
        next: async (respuesta) => {
          this.guardando = false;
 
          if (respuesta?.status === 'success') {
            await this.mostrarToast('Registro exitoso. Ya puedes iniciar sesión.');
            this.limpiarFormulario();
            this.router.navigateByUrl('/login', { replaceUrl: true });
          } else {
            this.mensajeError = respuesta?.mensaje || 'No se pudo completar el registro.';
          }
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse | any) => {
          console.error('Error en registro:', error);
          this.guardando = false;
 
          if (error?.name === 'TimeoutError') {
            this.mensajeError = 'El servidor tardó demasiado en responder. Inténtalo de nuevo.';
          } else if (error?.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Verifica la IP y la red Wi-Fi.';
          } else {
            this.mensajeError = error?.error?.mensaje || 'No se pudo registrar. Inténtalo de nuevo.';
          }
          this.cdr.detectChanges();
        }
      });
  }
 
  irALogin(): void {
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
 
  private limpiarFormulario(): void {
    this.usuario = { nombre: '', matricula: '', correo: '', contra: '' };
    this.confirmarContra = '';
    this.verContra = false;
  }
 
  private async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 2500, position: 'bottom' });
    await toast.present();
  }
}