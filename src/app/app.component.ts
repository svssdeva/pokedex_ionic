import {Component, OnDestroy, OnInit, QueryList, Renderer2, ViewChildren} from '@angular/core';
import {
  ActionSheetController, AlertController, IonRouterOutlet,
  LoadingController,
  MenuController,
  ModalController, NavController,
  Platform,
  PopoverController
} from '@ionic/angular';
import {GlobalService} from './services/global-service/global-service.service';
import { StatusBar } from '@capacitor/status-bar';
import {Router} from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  appVersion: number;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  isAvailableForeUpdate = false;
  constructor(private globalService: GlobalService,
              private menuController: MenuController,
              private renderer2: Renderer2,
              private platform: Platform,
              private menu: MenuController,
              private modalCtrl: ModalController,
              private popoverCtrl: PopoverController,
              private actionSheetCtrl: ActionSheetController,
              private loaderContrl: LoadingController,
              private alertController: AlertController,
              private navController: NavController,
              private router: Router) {
    this.appVersion = this.globalService.appVersion || 1;
    this.platform.ready().then(() => {
      this.globalService.getNetWorkStatus();
      if (this.platform.is('hybrid')) {
        this.hideStatusBar();
      }
    });
    this.initializeApp();
  }
  initializeApp() {
    this.backButtonEvent();
  }
  ngOnInit() {
  }
  async ngOnDestroy() {
   if (this.platform.is('hybrid')) {
     this.showStatusBar();
   }
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
  hideStatusBar() {
    StatusBar.hide();
  }

  showStatusBar() {
    StatusBar.show();
  }

  backButtonEvent() {
    const that = this;
    this.platform.backButton.subscribeWithPriority(1000, async ()=> {
      if (that.isAvailableForeUpdate) {
        if (new Date().getTime() - that.lastTimeBackPress < that.timePeriodToExit) {
          navigator['app'].exitApp();
        } else {
          that.globalService.showMessage('toast', {message: 'Press back again to exit App.'});
          that.lastTimeBackPress = new Date().getTime();
          return;
        }
      }
      const menu = await that.menu.getOpen();
      if (menu) {
        await menu.close();
        return {};
      }
      const actionSheet = await that.actionSheetCtrl.getTop();
      if (actionSheet) {
        await actionSheet.dismiss();
        return {};
      }
      const popover = await that.popoverCtrl.getTop();
      if (popover) {
        await popover.dismiss();
        return {};
      }

      const modal = await that.modalCtrl.getTop();
      if (modal) {
        await modal.dismiss();
        return {};
      }

      const loader = await that.loaderContrl.getTop();
      if (loader) {
        await loader.dismiss();
        return {};
      }

      const alert = await that.alertController.getTop();
      if (alert) {
        await alert.dismiss();
        return {};
      }
      that.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        if (that.router.url === 'home' || that.router.url === '') {
          if (new Date().getTime() - that.lastTimeBackPress < that.timePeriodToExit) {
            navigator['app'].exitApp();
          } else {
            that.globalService.showMessage('toast', {message: 'Press back again to exit App.'});
            that.lastTimeBackPress = new Date().getTime();
          }
        } else if (outlet && outlet.canGoBack()) {
          that.navController.pop();
        } else {
          that.navController.pop();
        }

      });
    });
  }
}
