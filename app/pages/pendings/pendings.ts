import {NavController, NavParams, Modal, Alert, Loading} from 'ionic-angular';
import {Component} from '@angular/core';

import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';

import {AppStorage} from '../../providers/app-storage/app-storage';
import {Fetch} from '../../providers/fetch/fetch';
import {Language} from '../../providers/language/language';

import {SourceModalPage} from '../source-modal/source-modal';

@Component({
  templateUrl: 'build/pages/pendings/pendings.html',
  pipes: [TranslatePipe]
})
export class PendingsPage {
  public projectId: string;
  public pendings: Array<any> = [];
  public currentTransition = null;

  constructor(public nav: NavController, public params: NavParams, public translate: TranslateService, public storage: AppStorage, public fetch: Fetch, public language: Language) {
    this.projectId = params.get('pId');
    this.loadPendings();
  }

  loadPendings(dismissOnEmpty?: boolean) {
    let moment = this.language.getMoment();
    this.storage.getPendingsFromProjectId(this.projectId).then(pendings => {
      this.pendings = pendings;
      for (var i = 0; i < this.pendings.length; i++) {
        this.pendings[i].datestring = moment(this.pendings[i].date).format("LL");
      }
      if (dismissOnEmpty && this.pendings.length == 0) {
        this.nav.pop();
      }
    });
  }

  solvePending(pending: any) {
    if (!this.fetch.isISBNCached(pending.isbn)) {
      var loading = Loading.create();
      var isLoading = true;
      this.nav.present(loading);
    }else {
      var isLoading = false;
    }
    this.fetch.fromISBN(pending.isbn).then(data => {
      if (isLoading) {
        var loadingTransition = loading.dismiss();
      }
      pending.data = data;
      pending.isLoaded = true;
      this.storage.setPendingFromId(pending._id, pending);
      
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
          let alert = Alert.create({
            title: translations["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TITLE"],
            message: translations["PROJECT.PENDING.POPUP.BOOK_UNAVAILABLE_TEXT"],
            buttons: [
              {
                text: translations["PROJECT.PENDING.POPUP.SEARCH"],
                handler: () => {
                  let i = this.pendings.indexOf(pending);
                  this.pendings[i].not_available = true;
                  this.storage.setPendingFromId(this.pendings[i]._id, this.pendings[i]);
                  this.currentTransition = alert.dismiss();
                  this.openModalWithBrowser(this.pendings[i]);
                  return false;
                }
              },
              {
                text: translations["PROJECT.PENDING.POPUP.LATER"],
                handler: () => {
                  let i = this.pendings.indexOf(pending);
                  this.pendings[i].not_available = true;
                  this.storage.setPendingFromId(this.pendings[i]._id, this.pendings[i]);
                }
              }
            ]
          });

          this.nav.present(alert);
        });
      }else if (err == 408) {
        this.translate.get(["PROJECT.PENDING.POPUP.TIMEOUT_TITLE", "PROJECT.PENDING.POPUP.TIMEOUT_TEXT", "PROJECT.PENDING.POPUP.CANCEL", "PROJECT.PENDING.POPUP.RETRY"]).subscribe((translations) => {
          let alert = Alert.create({
            title: translations["PROJECT.PENDING.POPUP.TIMEOUT_TITLE"],
            message: translations["PROJECT.PENDING.POPUP.TIMEOUT_TEXT"],
            buttons: [
              {
                text: translations["PROJECT.PENDING.POPUP.CANCEL"]
              },
              {
                text: translations["PROJECT.PENDING.POPUP.RETRY"],
                handler: () => {
                  this.solvePending(pending);
                }
              }
            ]
          });
          this.nav.present(alert);
        });
      }else if (err >= 500 && err <= 599) {
        this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "PROJECT.DETAIL.POPUP.OK"]).subscribe(translations => {
          let alert = Alert.create({
            title: translations["PROJECT.DETAIL.POPUP.ERROR"],
            message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
            buttons: [
              {
                text: translations["PROJECT.DETAIL.POPUP.OK"]
              }
            ]
          });
        });
      }
    });
  }

  openAfterLoad(data: any, id: string) {
    let modal = Modal.create(SourceModalPage, {
      type: 'book',
      data: data,
      projectId: this.projectId,
      pendingId: id,
      hideScan: true
    });

    modal.onDismiss(() => {
      this.loadPendings(true);
    });

    this.nav.present(modal);
  }

  openModalWithBrowser(pending) {
    let modal = Modal.create(SourceModalPage, {
      type: 'book',
      projectId: this.projectId,
      pendingId: pending._id,
      url: "http://google.ca/search?q=isbn+" + pending.isbn
    });

    modal.onDismiss(() => {
      this.loadPendings(true);
    });

    if (this.currentTransition) {
      this.currentTransition.then(() => {
        this.nav.present(modal);
      });
    }else {
      this.nav.present(modal);
    }
  }

  deletePending(pending) {
    this.storage.deletePending(pending._id).then(() => {
      this.loadPendings();
    });
  }

  ionViewWillEnter() {
    this.loadPendings();
  }
}
