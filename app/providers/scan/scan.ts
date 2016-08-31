import { Injectable } from '@angular/core';

import { ModalController, AlertController, LoadingController } from 'ionic-angular';
import { BarcodeScanner } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { BoardingScanPage } from '../../pages/boarding-scan/boarding-scan';

import { Fetch } from '../fetch/fetch';
import { Report } from '../report/report';
import { Settings } from '../settings/settings';


@Injectable()
export class Scan {

  constructor(public modalCtrl: ModalController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public translate: TranslateService, public fetch: Fetch, public settings: Settings, public report: Report) {}

  scan(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.settings.get('scanBoardingDone')) {
        let modal = this.modalCtrl.create(BoardingScanPage);
        modal.onDidDismiss(() => {
          this.openScanner()
          .then((data) => resolve(data))
          .catch(err => reject(err));
        });
        this.settings.set('scanBoardingDone', true);
        modal.present();
      }else {
        this.openScanner()
        .then((data) => resolve(data))
        .catch(err => reject(err));
      }
    });
  }

  private openScanner(): Promise<any> {
    return new Promise((resolve, reject) => {
      BarcodeScanner.scan().then((data) => {
        if (!data.cancelled) {
          if (data.format == "EAN_13") {
            this.fetchFromISBN(data.text).then(data => {
              resolve(data);
            });
          }else {
            this.alertWrongBarcode(resolve);
          }
        }
      }).catch((err) => {
        this.alertScanUnavailable(resolve);
      });
    });
  }

  private fetchFromISBN(isbn: string, transition: Promise<any> = Promise.resolve()): Promise<any> {
    return new Promise((resolve, reject) => {
      transition.then(() => {
        if (navigator.onLine) {
          if (!this.fetch.isISBNCached(isbn)) {
            var loading = this.loadingCtrl.create();
            var isLoading = true;
            loading.present();
          }else {
            var isLoading = false;
          }
          this.fetch.fromISBN(isbn).then((response) => {
            if (isLoading) {
              var loadingTransition = loading.dismiss();
            }
            resolve({
              data: response,
              transition: loadingTransition || Promise.resolve()
            });
          }).catch((response) => {
            if (isLoading) {
              loading.dismiss();
            }
            switch (response) {
              case 404:
                this.alert404(resolve);
                break;
              case 408:
                this.alert408(resolve, isbn);
                break;
              case 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 520, 521, 522, 523, 524, 525, 526, 530:
                this.alert500(resolve);
                break;
              default:
                resolve({});
                this.report.report(response);
            }
          });
        }else {
          this.alertOffline(resolve, isbn);
        }
      });
    });
  }

  private alert404(resolve: (any) => any) {
    this.translate.get(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
        message: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT"],
        buttons: [
          {
            text: translations['PROJECT.DETAIL.POPUP.OK'],
            handler: () => {
              resolve({});
            }
          }
        ]
      });
      alert.present();
    });
  }

  private alert408(resolve: (any) => void, isbn: string) {
    this.translate.get(["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE", "PROJECT.DETAIL.POPUP.TIMEOUT_TEXT", "PROJECT.DETAIL.POPUP.ADD", "PROJECT.DETAIL.POPUP.RETRY"]).subscribe((translations) => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE"],
        message: translations["PROJECT.DETAIL.POPUP.TIMEOUT_TEXT"],
        buttons: [
          {
            text: translations["PROJECT.DETAIL.POPUP.RETRY"],
            handler: () => {
              this.fetchFromISBN(isbn, alert.dismiss()).then((response) => {
                resolve(response);
              });
              return false;
            }
          },
          {
            text: translations['PROJECT.DETAIL.POPUP.ADD'],
            handler: () => {
              resolve({
                isbn: isbn,
                addPending: true,
                transition: alert.dismiss()
              });
              return false;
            }
          }
        ]
      });
      alert.present();
    });
  }

  private alert500(resolve: (any) => void) {
    this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.ERROR"],
        message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
        buttons: [
          {
            text: translations['PROJECT.DETAIL.POPUP.OK'],
            handler: () => {
              resolve({});
            }
          }
        ]
      });
      alert.present();
    });
  }

  private alertOffline(resolve: (any) => void, isbn: string) {
    this.translate.get(["PROJECT.DETAIL.POPUP.NO_CONNECTION", "PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS", "PROJECT.DETAIL.POPUP.RETRY", "PROJECT.DETAIL.POPUP.ADD"]).subscribe((translations) => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.NO_CONNECTION"],
        message: translations["PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS"],
        buttons: [
          {
            text: translations["PROJECT.DETAIL.POPUP.RETRY"],
            handler: () => {
              this.fetchFromISBN(isbn, alert.dismiss()).then(response => {
                resolve(response);
              });
              return false;
            }
          },
          {
            text: translations["PROJECT.DETAIL.POPUP.ADD"],
            handler: () => {
              resolve({
                isbn: isbn,
                addPending: true,
                transition: alert.dismiss()
              });
              return false;
            }
          }
        ]
      });
      alert.present();
    });
  }

  private alertScanUnavailable(resolve: (any) => void) {
    this.translate.get(["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN", "PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN"],
        message: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT"],
        buttons: [
          {
            text: translations['PROJECT.DETAIL.POPUP.OK'],
            handler: () => {
              resolve({});
            }
          }
        ]
      });
      alert.present();
    });
  }

  private alertWrongBarcode(resolve: (any) => void) {
    this.translate.get(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
      let alert = this.alertCtrl.create({
        title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
        message: translations["PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE"],
        buttons: [
          {
            text: translations['PROJECT.DETAIL.POPUP.OK'],
            handler: () => {
              resolve({});
            }
          }
        ]
      });
      alert.present();
    });
  }
}
