import {Injectable} from '@angular/core';
import {AlertController} from 'ionic-angular';

import {Settings} from '../settings/settings';
import {UserReport} from '../user-report/user-report';

import {TranslateService} from 'ng2-translate/ng2-translate';

declare var inAppPurchase: any;

@Injectable()
export class AdvancedMode {
  public price: number = null;
  private productId: string = "";

  constructor(public translate: TranslateService, public settings: Settings, public alertCtrl: AlertController, public report: UserReport) {
    if (!!window.cordova) {
      inAppPurchase.getProducts(["com.fclavette.metho.advanced"]).then(products => {
        let product = products[0];
        this.price = product.price;
        this.productId = product.productId;
      }).catch(err => {
        this.report.report(err);
      });
    }
  }

  enable(): Promise<any> {
    if (!this.settings.get("advanced")) {
      return new Promise((resolve, reject) => {
        if (navigator.onLine) {
          this.translate.get(["SETTINGS.ADVANCED_MODE.TITLE", "SETTINGS.ADVANCED_MODE.POPUP.WILL_RESTORE", "PROJECT.TAB.MODAL.CANCEL", "PROJECT.DETAIL.POPUP.OK"]).subscribe(translations => {
            let alertPopup = this.alertCtrl.create({
              title: translations["SETTINGS.ADVANCED_MODE.TITLE"],
              message: translations["SETTINGS.ADVANCED_MODE.POPUP.WILL_RESTORE"],
              buttons: [
                {
                  text: translations["PROJECT.TAB.MODAL.CANCEL"],
                  handler: () => {
                    reject();
                  }
                },
                {
                  text: translations["PROJECT.DETAIL.POPUP.OK"],
                  handler: () => {
                    inAppPurchase.restorePurchases().then((data) => {
                      if (data.length && data[0].productId == this.productId) {
                        this.settings.set('advanced', true);
                        resolve();
                      }else {
                        inAppPurchase.buy(this.productId).then((data) => {
                          this.settings.set('advanced', true);
                          resolve();
                        }).catch(err => {
                          this.report.report("catch-buy" + err);
                          reject();
                        });
                      }
                    }).catch(err => {
                      this.report.report("catch-restore" + err);
                      reject();
                    });
                  }
                }
              ]
            });

            alertPopup.present();
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
