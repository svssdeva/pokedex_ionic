import {Component, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {MenuController, Platform} from '@ionic/angular';
import {GlobalService} from './services/global-service/global-service.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  appVersion: number;
  constructor(private globalService: GlobalService,
              private menuController: MenuController,
              private renderer2: Renderer2,
              private platform: Platform) {
    this.appVersion = this.globalService.appVersion || 1;
    this.platform.ready().then(() => {
      this.globalService.getNetWorkStatus();
    });
  }

  ngOnInit() {

  }
  async ngOnDestroy() {
    this.globalService.removeNetworkListeners();
  }
  onClick(event) {
    if (event.detail.checked) {
      this.renderer2.setAttribute(document.body, 'color-theme', 'dark');
    } else {
      this.renderer2.setAttribute(document.body, 'color-theme', 'light');
    }
  }

  colorTest(systemInitiatedDark) {
    if (systemInitiatedDark.matches) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }
}
