import { Injectable, EventEmitter } from '@angular/core';

import { AlertController } from 'ionic-angular';
import { InAppPurchase } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { Report } from './report';
import { Settings } from './settings';

interface CordovaWindow extends Window {
  cordova: any;
}
declare var window: CordovaWindow;


@Injectable()
export class AdvancedMode {
  public price: string = "";
  public hasLoaded: boolean = false;
  public loadEvents: EventEmitter<any> = new EventEmitter();
  public productId: string = "";

  constructor(
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public report: Report,
    public settings: Settings,
  ) {
    this.init();
  }

  init() {
    if (navigator.onLine) {
      InAppPurchase.getProducts(["com.fclavette.metho.advanced"]).then(products => {
        let product = products[0];
        this.price = product.price;
        this.productId = product.productId;
        this.hasLoaded = true;
        this.loadEvents.emit(true);
      }).catch(err => {
        if (err != "cordova_not_available") {
          this.report.report(err);
        }
        this.price = "1,39$";
        this.hasLoaded = true;
        this.loadEvents.emit(true);
      });
    }else {
      setTimeout(() => {
        this.init();
      }, 5000);
    }
  }

  enable(): Promise<any> {
    if (!this.settings.get("advanced") && !!window.cordova) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine && this.hasLoaded) {
          InAppPurchase.buy(this.productId).then((data) => {
            this.settings.set('advanced', true);
            resolve();
          }).catch(err => {
            reject();
          });
        }else {
          this.translate.get(["COMMON.OK", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"]).subscribe(translations => {
            let alert = this.alertCtrl.create({
              title: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE"],
              message: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"],
              buttons: [
                {
                  text: translations["COMMON.OK"],
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
      this.settings.set('advanced', true);
      return Promise.resolve();
    }
  }

  restore(): Promise<any> {
    if (!this.settings.get("advanced")) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine) {
          InAppPurchase.restorePurchases().then((data) => {
            if (data.length && data[0].productId == this.productId) {
              this.settings.set('advanced', true);
              resolve();
            }else {
              this.translate.get(["SETTINGS.ADVANCED_MODE.POPUP.RESTORE", "SETTINGS.ADVANCED_MODE.POPUP.RESTORE_NO_FOUND", "COMMON.OK"]).subscribe((translations) => {
                let alert = this.alertCtrl.create({
                  title: translations["SETTINGS.ADVANCED_MODE.POPUP.RESTORE"],
                  message: translations["SETTINGS.ADVANCED_MODE.POPUP.RESTORE_NO_FOUND"],
                  buttons: [
                    {
                      text: translations["COMMON.OK"]
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
          this.translate.get(["COMMON.OK", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE", "SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"]).subscribe(translations => {
            let alert = this.alertCtrl.create({
              title: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK_TITLE"],
              message: translations["SETTINGS.ADVANCED_MODE.POPUP.ERR_NETWORK"],
              buttons: [
                {
                  text: translations["COMMON.OK"],
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
