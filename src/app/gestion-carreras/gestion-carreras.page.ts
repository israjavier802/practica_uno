import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController } from '@ionic/angular';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonItem,IonSelect, IonInput,IonSelectOption,IonButton,IonList } from '@ionic/angular';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-gestion-carreras',
  templateUrl: './gestion-carreras.page.html',
  styleUrls: ['./gestion-carreras.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule,IonItem,IonSelect, IonInput,IonSelectOption,IonButton,IonList]
})
export class GestionCarrerasPage implements OnInit {
  carrera={nombre:'', tipo:''};
  lista_tipos = ['LICENCIATURA','INGENIERIA','MAESTRIA'];

  constructor(private alertController:AlertController, private http:HttpClient, private cdr:ChangeDetectorRef, private api: ApiService) { }

  async mostrarAlerta(mensaje: string){
    const alert = await this.alertController.create({
      header:'Atencion',
      message: mensaje,
      buttons : ['OK']
    });
    await alert.present();
    await alert.onDidDismiss();
    
  }

  limpiarFormulario() {
  console.log('Se ejecutó limpiarFormulario');
  this.carrera = {
    nombre: '',
    tipo:''
  };
  this.cdr.detectChanges();
}

 validarGuardar(){
    if (this.carrera.nombre.trim()===''){
      this.mostrarAlerta('El nombre no puede estar vacio');
      return;
    }
    
    if (this.carrera.tipo.trim()===''){
      this.mostrarAlerta('Selecciona un tipo de Carrera');
      return;
    }

  console.log('Datos listos para enviar',this.carrera);

  const urlAPI = this.api.url('api_ionic/registro_carrera.php');

    this.http.post<{ status: string; mensaje: string }>(urlAPI, this.carrera).subscribe({
      next: async (respuesta) => {
        await this.mostrarAlerta(respuesta.mensaje);

        if (respuesta.status === 'success') {
          this.limpiarFormulario();
        }
      },
      error: async (error: HttpErrorResponse) => {
        await this.mostrarAlerta(
          error.error?.mensaje || 'No se pudo conectar con el servidor.'
        );

        if (error.status === 409) {
          this.limpiarFormulario();
        }
      }
    });
  }

  ngOnInit() {
  }

}
