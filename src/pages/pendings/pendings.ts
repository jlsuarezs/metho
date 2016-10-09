import { Component } from '@angular/core';

import { NavController, NavParams, ModalController, AlertController, LoadingController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { SourceModalBookPage } from '../source-modal-book/source-modal-book';

import { AppStorage } from '../../providers/app-storage';
import { Fetch } from '../../providers/fetch';
import { Language } from '../../providers/language';


@Component({
  selector: 'pendings',
  templateUrl: 'pendings.html'
})
export class PendingsPage {
  public projectId: string;
  public pendings: Pending[] = [];

  constructor(
    public nav: NavController,
    public params: NavParams,
    public translate: TranslateService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    public storage: AppStorage,
    public fetch: Fetch,
    public language: Language,
  ) {
    this.projectId = params.get('pId');
  }

  loadPendings(dismissOnEmpty?: boolean) {
    let moment = this.language.getMoment();
    this.storage.getPendingsFromProjectId(this.projectId).then(pendings => {
      this.pendings = pendings.map(pending => {
        pending.datestring = moment(pending.date).format("LL");
        return pending;
      });
      if (dismissOnEmpty && this.pendings.length == 0) {
        this.nav.pop();
      }
    });
  }

  solvePending(pending: Pending) {
    if (!this.fetch.isISBNCached(pending.isbn)) {
      var loading = this.loadingCtrl.create();
      var isLoading = true;
      loading.present();
    }else {
      var isLoading = false;
    }
    this.fetch.fromISBN(pending.isbn).then(data => {
      if (isLoading) {
        var loadingTransition = loading.dismiss();
      }
      let i = this.pendings.indexOf(pending);
      this.pendings[i].isLoaded = true;
      this.pendings[i].data = data;
      this.storage.setPendingFromId(this.pendings[i]._id, this.pendings[i]);
      if (isLoading) {
        loadingTransition.then(() => {
          this.openAfterLoad(data, pending._id);
        });
      }else {
        this.openAfterLoad(data, pending._id);
      }
    }).catch(err => {
      loading.dismiss();
      if (err == 404) {
        this.translate.get(["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TEXT", "PROJECT.PENDING.POPUP.SEARCH", "PROJECT.PENDING.POPUP.LATER"]).subscribe(translations => {
          let alert = this.alertCtrl.create({
            title: translations["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TITLE"],
            message: translations["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TEXT"],
            buttons: [
              {
                text: translations["PROJECT.PENDING.POPUP.SEARCH"],
                handler: () => {
                  let i = this.pendings.indexOf(pending);
                  this.pendings[i].notAvailable = true;
                  this.storage.setPendingFromId(this.pendings[i]._id, this.pendings[i]);
                  this.openModalWithBrowser(this.pendings[i], alert.dismiss());
                  return false;
                }
              },
              {
                text: translations["PROJECT.PENDING.POPUP.LATER"],
                handler: () => {
                  let i = this.pendings.indexOf(pending);
                  this.pendings[i].notAvailable = true;
                  this.storage.setPendingFromId(this.pendings[i]._id, this.pendings[i]);
                }
              }
            ]
          });

          alert.present();
        });
      }else if (err == 408) {
        this.translate.get(["PROJECT.PENDING.POPUP.TIMEOUT_TITLE", "PROJECT.PENDING.POPUP.TIMEOUT_TEXT", "COMMON.CANCEL", "PROJECT.PENDING.POPUP.RETRY"]).subscribe((translations) => {
          let alert = this.alertCtrl.create({
            title: translations["PROJECT.PENDING.POPUP.TIMEOUT_TITLE"],
            message: translations["PROJECT.PENDING.POPUP.TIMEOUT_TEXT"],
            buttons: [
              {
                text: translations["COMMON.CANCEL"]
              },
              {
                text: translations["PROJECT.PENDING.POPUP.RETRY"],
                handler: () => {
                  this.solvePending(pending);
                }
              }
            ]
          });
          alert.present();
        });
      }else if (err >= 500 && err <= 599) {
        this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "COMMON.OK"]).subscribe(translations => {
          let alert = this.alertCtrl.create({
            title: translations["PROJECT.DETAIL.POPUP.ERROR"],
            message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
            buttons: [
              {
                text: translations["COMMON.OK"]
              }
            ]
          });

          alert.present();
        });
      }
    });
  }

  openAfterLoad(data: Source, id: string) {
    let modal = this.modalCtrl.create(SourceModalBookPage, {
      data: data,
      projectId: this.projectId,
      pendingId: id,
      hideScan: true
    });

    modal.onWillDismiss(() => {
      this.loadPendings(true);
    });

    modal.present();
  }

  openModalWithBrowser(pending: Pending, transition=Promise.resolve()) {
    let modal = this.modalCtrl.create(SourceModalBookPage, {
      projectId: this.projectId,
      pendingId: pending._id,
      url: "http://google.ca/search?q=isbn+" + pending.isbn
    });

    modal.onWillDismiss(() => {
      this.loadPendings(true);
    });


    transition.then(() => {
      modal.present();
    });
  }

  deletePending(pending: Pending) {
    this.storage.deletePending(pending._id).then(() => {
      this.loadPendings(true);
    });
  }

  ionViewWillEnter() {
    this.loadPendings();
  }
}