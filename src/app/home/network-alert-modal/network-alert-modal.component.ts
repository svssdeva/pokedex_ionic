import {Component, OnDestroy, OnInit} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {Subscription} from 'rxjs';
import {GlobalService} from '../../services/global-service/global-service.service';

@Component({
  selector: 'app-network-alert-modal',
  templateUrl: './network-alert-modal.component.html',
  styleUrls: ['./network-alert-modal.component.scss'],
})
export class NetworkAlertModalComponent implements OnInit, OnDestroy {
  networkSubscription: Subscription;
  connected: boolean;
  constructor(private modalController: ModalController,
              private globalService: GlobalService) { }

  ngOnInit() {
    this.networkSubscription = this.globalService.getNetworkConnectionValue().subscribe(res => {
      this.connected = res;
    });
  }
  async ngOnDestroy() {
    this.networkSubscription.unsubscribe();
  }
}
