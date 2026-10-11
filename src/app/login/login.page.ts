import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton,
  ToastController
} from '@ionic/angular';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton],
})
export class LoginPage {
  usuario = { correo: '', contra: '' };
  ipServidor: string;

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private router: Router,
    private api: ApiService
  ) {
    this.ipServidor = this.api.ip; 
  }

  login() {
    if (!this.ipServidor.trim()) { this.mostrarToast('Ingresa la IP del servidor'); return; }
    if (!this.usuario.correo || !this.usuario.contra) { this.mostrarToast('Llena correo y contraseña'); return; }

    this.api.ip = this.ipServidor;                 
    const url = this.api.url('api_ionic/login.php');

    this.http.post<any>(url, this.usuario).subscribe({
      next: (res) => {
        if (res.success) {
          this.mostrarToast('¡Bienvenido!');
          this.router.navigateByUrl('/home', { replaceUrl: true });
        } else {
          this.mostrarToast(res.message);
        }
      },
      error: (err) => {
        alert('ERROR: ' + JSON.stringify(err));
        this.mostrarToast(`Error al conectar con: ${url}`);
      },
    });
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({ message: mensaje, duration: 3000, position: 'bottom' });
    toast.present();
  }
}