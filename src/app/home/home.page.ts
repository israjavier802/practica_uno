import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon,
  AlertController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon],
})
export class HomePage {
  constructor(private router: Router, private alertCtrl: AlertController) {
    addIcons({ logOutOutline });
  }

  async cerrarSesion() {
    const alerta = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que quieres salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => {
            // replaceUrl evita que con "atrás" se regrese al home
            this.router.navigateByUrl('/login', { replaceUrl: true });
          },
        },
      ],
    });
    await alerta.present();
  }
}