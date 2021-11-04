import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy,} from '@ionic/angular';
import {AsyncPipe, registerLocaleData} from '@angular/common';
import localeEn from '@angular/common/locales/en';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {HttpClientModule} from '@angular/common/http';
import {ServiceWorkerModule, SwRegistrationOptions} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireDatabaseModule} from '@angular/fire/database';

import {FirebaseMessagingWebService} from './services/firebase-messaging-web/firebase-messaging-web.service';

registerLocaleData(localeEn);

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: environment.production,
    // Register the ServiceWorker as soon as the app is stable
    // or after 30 seconds (whichever comes first).
    registrationStrategy: 'registerWhenStable:30000'
  }),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule],
  providers: [{provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
    {provide: LOCALE_ID, useValue: 'en-EN'},
    {
      provide: SwRegistrationOptions,
      useFactory: () => ({enabled: environment.production})
    },
    FirebaseMessagingWebService,
    AsyncPipe,
  ],

  bootstrap: [AppComponent],
})
export class AppModule {
}
