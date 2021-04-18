import { Injectable } from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  appVersion = 1;
  constructor(private toastController: ToastController,
              private alertController: AlertController) { }

  async showMessage(type, data) {
    switch (type.toLowerCase()) {
      case 'alert' :
        await this.presentAlert(data);
        break;
      case 'toast' :
        await this.presentToast(data);
        break;
    }
  }

  async presentToast(data) {
    const toast = await this.toastController.create({
      message: data.message,
      duration: (data.duration) ? data.duration : 2000
    });
    return await toast.present();
  }

  async presentAlert(data) {
    const alert = await this.alertController.create({
      header: data.title,
      subHeader: data.subHeader,
      message: data.message,
      buttons: ['OK']
    });

    return await alert.present();
  }

}
