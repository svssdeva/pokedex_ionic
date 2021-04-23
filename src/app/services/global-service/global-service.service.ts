import { Injectable } from '@angular/core';
import {AlertController, ToastController} from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import {BehaviorSubject} from "rxjs";

// eslint-disable-next-line @typescript-eslint/naming-convention
const { Network } = Plugins;
@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  appVersion = 1;
  private _networkStatus$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  constructor(private toastController: ToastController,
              private alertController: AlertController) {
   Network.addListener('networkStatusChange', (status) => {
      this.setNetworkConnectionValue(status.connected);
    });
  }
  getNetWorkStatus() {
    Network.getStatus().then(status => {
      this.setNetworkConnectionValue(status.connected);
    });
  }
  setNetworkConnectionValue(value: boolean) {
    this._networkStatus$.next(value);
  }
  getNetworkConnectionValue() {
    return this._networkStatus$.asObservable();
  }
  removeNetworkListeners() {
    Network.removeAllListeners();
  }
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
