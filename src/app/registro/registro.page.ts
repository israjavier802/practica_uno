import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton, IonContent, IonHeader, IonIcon, IonInput,
  IonItem, IonList, IonTitle, IonToolbar
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  heart, home, mailOutline, personOutline, readerOutline
} from 'ionicons/icons';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, CommonModule,
    FormsModule, IonButton, IonIcon, IonList, IonItem, IonInput
  ]
})
export class RegistroPage implements OnInit {
  usuario = {
    nombre: '',
    matricula: '',
    correo: ''
  };

  mensajeError = '';
  guardando = false;

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef, private api:ApiService) {
    addIcons({ heart, home, personOutline, mailOutline, readerOutline });
  }

  ngOnInit() {}

  guardarDatos(): void {
    this.mensajeError = '';

    const alumno = {
      nombre: this.usuario.nombre.trim(),
      matricula: this.usuario.matricula.trim(),
      correo: this.usuario.correo.trim()
    };

    if (!alumno.nombre || !alumno.matricula || !alumno.correo) {
      this.mensajeError = 'Completa todos los campos.';
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alumno.correo)) {
      this.mensajeError = 'Ingresa un correo válido.';
      return;
    }

    if (this.guardando) return;
    this.guardando = true;

    const urlAPI = this.api.url('api_ionic/registro.php');

    this.http.post<{ status: string; mensaje: string }>(urlAPI, alumno).subscribe({
      next: (respuesta) => {
        console.log('NEXT ejecutado', respuesta);
        this.guardando = false;
        this.cdr.detectChanges();

        if (respuesta.status === 'success') {
          this.router.navigate(['/home']);
        } else {
          this.mensajeError = respuesta.mensaje || 'No se pudo registrar al alumno.';
          
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log('ERROR ejecutado', error);
        this.guardando = false;
        this.mensajeError =
          error.error?.mensaje ||
          'No se pudo conectar con el servidor. Inténtalo de nuevo.';
        this.cdr.detectChanges(); 
      }
    });
  }
}