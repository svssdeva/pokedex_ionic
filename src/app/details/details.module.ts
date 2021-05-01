import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsPageRoutingModule } from './details-routing.module';

import { DetailsPage } from './details.page';
import {ApiService} from '../services/api-service/api-service.service';
import { SafePipeModule } from 'safe-pipe';
import {HapticsService} from "../services/haptics/haptics.service";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailsPageRoutingModule,
    SafePipeModule,
  ],
  declarations: [DetailsPage],
  providers: [ApiService, HapticsService]
})
export class DetailsPageModule {}
