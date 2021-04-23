import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import {ApiService} from '../services/api-service/api-service.service';
import {NetworkAlertModalComponent} from './network-alert-modal/network-alert-modal.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage, NetworkAlertModalComponent],
  providers: [ApiService]
})
export class HomePageModule {}
