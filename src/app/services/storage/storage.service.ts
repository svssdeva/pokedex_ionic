import { Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() {
  }
  /***capacitor storage start***/
  async setObject(key, value) {
    await Storage.set({
      key,
      value: JSON.stringify(value)
    });
  }
  async getObject(key) {
    const ret = await Storage.get({ key });
    return ret.value;
  }

  async setItem(key: string, value: string) {
    await Storage.set({
      key,
      value
    });
  }

  async getItem(key: string) {
    const { value } = await Storage.get({ key });
   return value;
  }

  async removeItem(key) {
    await Storage.remove({ key });
  }

  async keys() {
    const { keys } = await Storage.keys();
    console.log('Got keys: ', keys);
  }

  async clear() {
    await Storage.clear();
  }

  /***capacitor storage end***/


}
