import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertController, IonRouterLink } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { IonContent, IonHeader, IonTitle, IonToolbar,IonItem,IonSelect, IonInput,IonSelectOption,IonButton,IonList,IonButtons } from '@ionic/angular';
import { ApiService } from '../services/api';

@Component({
  selector: 'app-gestion-alumnos',
  templateUrl: './gestion-alumnos.page.html',
  standalone: true,
  styleUrls: ['./gestion-alumnos.page.scss'],
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonItem,IonInput,
    IonSelectOption,IonButton,IonList, IonSelect, IonRouterLink, IonButtons]
})
export class GestionAlumnosPage implements OnInit {
  alumnos={n_control:'', nombre:'', snombre:'',apat: '', mpat:'',fecha_nac:'',genero:'',fk_caralu:''};
  lista_carreras: { id: number; nombre: string }[] = [];

  constructor(private alertController:AlertController, private http:HttpClient, private cdr:ChangeDetectorRef, private api: ApiService ) {}

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
  this.alumnos = {
    n_control: '',
    nombre: '',
    snombre: '',
    apat: '',
    mpat: '',
    fecha_nac: '',
    genero: '',
    fk_caralu: ''
  };
  this.cdr.detectChanges();
}



  validarGuardar(){
    if (this.alumnos.nombre.trim()===''){
      this.mostrarAlerta('El nombre no puede estar vacio');
      return;
    }
    
    if (this.alumnos.n_control.trim()===''){
      this.mostrarAlerta('El No.Control no puede estar vacio');
      return;
    }
    
    if (this.alumnos.fk_caralu ===''){
      this.mostrarAlerta('Selecciona una carrera');
      return;
    }

    if (this.alumnos.apat.trim()===''){
      this.mostrarAlerta('El Apellido Paterno no puede estar vacio')
      return;
    }

    if (this.alumnos.mpat.trim()===''){
      this.mostrarAlerta('El Apellido Materno no puede estar vacio')
      return;
    }

    if (this.alumnos.fecha_nac===''){
      this.mostrarAlerta('La Fecha de Nacimiento no puede estar vacia')
      return;
    }

const [anio, mes, dia] = this.alumnos.fecha_nac.split('-').map(Number);
const nacimiento = new Date(anio, mes - 1, dia);
const hoy = new Date();

if (
  !anio || !mes || !dia ||
  nacimiento.getFullYear() !== anio ||
  nacimiento.getMonth() !== mes - 1 ||
  nacimiento.getDate() !== dia
) {
  this.mostrarAlerta('Ingresa una fecha de nacimiento válida');
  return;
}

let edad = hoy.getFullYear() - anio;

if (
  hoy.getMonth() < mes - 1 ||
  (hoy.getMonth() === mes - 1 && hoy.getDate() < dia)
) {
  edad--;
}

if (edad < 12 || edad > 100) {
  this.mostrarAlerta('La edad debe estar entre 12 y 100 años');
  return;
}

    if (this.alumnos.genero===''){
      this.mostrarAlerta('Porfavor selecciona un genero')
      return;
    }


    console.log('Datos listos para enviar',this.alumnos);

   const urlAPI = this.api.url('api_ionic/registro_estudiante.php');

    this.http.post<{ status: string; mensaje: string }>(urlAPI, this.alumnos).subscribe({
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

cargarCarreras() {
  const urlAPI = this.api.url('api_ionic/listar_carreras.php');

  this.http.get<{ id: number; nombre: string }[]>(urlAPI).subscribe({
    next: (carreras) => {
      this.lista_carreras = carreras;
      this.cdr.detectChanges();
    },
    error: (error: HttpErrorResponse) => {
      this.mostrarAlerta(
        error.error?.mensaje || 'No se pudieron cargar las carreras.'
      );
    }
  });
}

ionViewWillEnter() {
  this.cargarCarreras();
}



  ngOnInit() {
  }

}