import {LOCALE_ID, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import {registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import  {HttpClientModule} from '@angular/common/http';

registerLocaleData(localeEn);
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: LOCALE_ID, useValue: 'en-EN'},],

  bootstrap: [AppComponent],
})
export class AppModule {}
