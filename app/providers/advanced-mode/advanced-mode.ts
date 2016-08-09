import {Injectable, EventEmitter} from '@angular/core';
import {AlertController} from 'ionic-angular';

import {Settings} from '../settings/settings';
import {UserReport} from '../user-report/user-report';

import {TranslateService} from 'ng2-translate/ng2-translate';

declare var inAppPurchase: any;

@Injectable()
export class AdvancedMode {
  public price: string = "";
  public hasLoaded: boolean = false;
  public loadEvents: EventEmitter<any> = new EventEmitter();
  private productId: string = "";

  constructor(public translate: TranslateService, public settings: Settings, public alertCtrl: AlertController, public report: UserReport) {
    if (!!window.cordova) {
      inAppPurchase.getProducts(["com.fclavette.metho.advanced"]).then(products => {
        let product = products[0];
        this.price = product.price;
        this.productId = product.productId;
        this.hasLoaded = true;
        this.loadEvents.emit(true);
      }).catch(err => {
        this.report.report(err);
      });
    }else {
      this.price = "1,39$";
      setTimeout(() => {
        this.hasLoaded = true;
        this.loadEvents.emit(true);
      }, 2000);
    }
  }

  enable(): Promise<any> {
    if (!this.settings.get("advanced")) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine && this.hasLoaded) {
          inAppPurchase.buy(this.productId).then((data) => {
            this.settings.set('advanced', true);
            resolve();
          }).catch(err => {
            reject();
          });
        }else {
          this.translate.get(["PROJECT.DETAIL.POPUP.OK", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"]).subscribe(translations => {
            let alert = this.alertCtrl.create({
              title: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE"],
              message: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"],
              buttons: [
                {
                  text: translations["PROJECT.DETAIL.POPUP.OK"],
                  handler: () => {
                    reject();
                  }
                }
              ]
            });

            alert.present();
          });
        }
      });
    }else {
      return Promise.resolve();
    }
  }

  restore(): Promise<any> {
    if (!this.settings.get("advanced")) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine) {
          inAppPurchase.restorePurchases().then((data) => {
            if (data.length && data[0].productId == this.productId) {
              this.settings.set('advanced', true);
              resolve();
            }else {
              this.translate.get(["SETTINGS.ADVANCED_MODE.POPUP.RESTORE", "SETTINGS.ADVANCED_MODE.POPUP.RESTORE_NO_FOUND", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
                let alert = this.alertCtrl.create({
                  title: translations["SETTINGS.ADVANCED_MODE.POPUP.RESTORE"],
                  message: translations["SETTINGS.ADVANCED_MODE.POPUP.RESTORE_NO_FOUND"],
                  buttons: [
                    {
                      text: translations["PROJECT.DETAIL.POPUP.OK"]
                    }
                  ]
                });

                alert.present();
              });
            }
          }).catch(err => {
            this.report.report("catch-restore" + err);
            reject();
          });
        }else {
          this.translate.get(["PROJECT.DETAIL.POPUP.OK", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"]).subscribe(translations => {
            let alert = this.alertCtrl.create({
              title: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE"],
              message: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"],
              buttons: [
                {
                  text: translations["PROJECT.DETAIL.POPUP.OK"],
                  handler: () => {
                    reject();
                  }
                }
              ]
            });

            alert.present();
          });
        }
      });
    }else {
      return Promise.resolve();
    }
  }

  disable() {
    this.settings.set('advanced', false);
  }

  isEnabled() {
    return this.settings.get('advanced');
  }
}
