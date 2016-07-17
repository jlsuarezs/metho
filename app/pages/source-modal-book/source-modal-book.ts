import {ViewController, NavParams, ModalController, NavController, AlertController, LoadingController} from 'ionic-angular';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {Component} from '@angular/core';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';
import {BarcodeScanner, SafariViewController} from 'ionic-native';

import {AppStorage} from '../../providers/app-storage/app-storage.ts';
import {Parse} from '../../providers/parse/parse.ts';
import {Fetch} from '../../providers/fetch/fetch.ts';
import {BoardingScanPage} from '../boarding-scan/boarding-scan';
import {Settings} from '../../providers/settings/settings';
import {Language} from '../../providers/language/language';
import {UserReport} from '../../providers/user-report/user-report';

@Component({
  templateUrl: 'build/pages/source-modal-book/source-modal-book.html',
  pipes: [TranslatePipe]
})
export class SourceModalBookPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: any;
  public url: string;
  public pendingId: string;
  public projectId: string;
  public hideScan: boolean;
  public showBrowser: boolean;
  public isAdvanced: boolean;
  public insertingFromScan: boolean;
  public firstname: string;
  public lastname: string;
  public currentTransition: any;
  public hasConfirmed: boolean = false;

  public form: ControlGroup;
  public _timeout: any;
  public instantList: Array<any>;
  public instantStatus: any = {
    loading: false,
    none: false,
    err500: false,
    noConnection: false,
    ok: false,
    shown: false
  };

  constructor(public viewCtrl: ViewController, public alertCtrl: AlertController, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public translate: TranslateService, public params: NavParams, public parse: Parse, public storage: AppStorage, public fb: FormBuilder, public nav: NavController, public fetch: Fetch, public settings: Settings, public language: Language, public report: UserReport) {
    if(this.params.get('editing') == true) {
      this.isNew = false;
    }else {
      this.isNew = true;
    }

    if (typeof this.params.get('data') !== "undefined") {
      this.noData = false;
      this.previous = this.params.get('data');
    }else {
      this.noData = true;
    }

    this.projectId = this.params.get('projectId');

    if (this.params.get('hideScan') == true) {
      this.hideScan = true;
    }else {
      this.hideScan = false;
    }

    if (typeof this.params.get('pendingId') !== "undefined") {
      this.pendingId = this.params.get('pendingId');
    }

    if (typeof this.params.get('url') !== "undefined") {
      this.url = this.params.get('url');
      this.showBrowser = true;
      SafariViewController.mayLaunchUrl(this.url);
      this.viewCtrl.didEnter.subscribe(() => {
        this.browser();
      });
    }else {
      this.showBrowser = false;
    }

    if (this.params.get('scan') == true) {
      this.viewCtrl.didEnter.subscribe(() => {
        this.scan();
      });
    }

    this.isAdvanced = this.settings.get("advanced");

    let moment = this.language.getMoment();

    this.form = fb.group({
      hasAuthors: [this.noData ? '' : this.previous.hasAuthors],
      author1lastname: [this.noData ? '' : this.previous.author1lastname],
      author1firstname: [this.noData ? '' : this.previous.author1firstname],
      author2lastname: [this.noData ? '' : this.previous.author2lastname],
      author2firstname: [this.noData ? '' : this.previous.author2firstname],
      author3lastname: [this.noData ? '' : this.previous.author3lastname],
      author3firstname: [this.noData ? '' : this.previous.author3firstname],
      title: [this.noData ? '' : this.previous.title],
      editor: [this.noData ? '' : this.previous.editor],
      publicationDate: [this.noData ? '' : this.previous.publicationDate],
      publicationLocation: [this.noData ? '' : this.previous.publicationLocation],
      pageNumber: [this.noData ? '' : this.previous.pageNumber],
      editionNumber: [this.noData ? '' : this.previous.editionNumber],
      volumeNumber: [this.noData ? '' : this.previous.volumeNumber],
      collection: [this.noData ? '' : this.previous.collection],
      hasBeenTranslated: [this.noData ? false : this.previous.hasBeenTranslated],
      translatedFrom: [this.noData ? '' : this.previous.translatedFrom],
      translator1firstname: [this.noData ? '' : this.previous.translator1firstname],
      translator1lastname: [this.noData ? '' : this.previous.translator1lastname],
      translator2firstname: [this.noData ? '' : this.previous.translator2firstname],
      translator2lastname: [this.noData ? '' : this.previous.translator2lastname]
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  submitIfEnter(event) {
    if (event.keyCode == 13 && !this.hasConfirmed) {
      this.confirm();
      this.hasConfirmed = true;
    }
  }

  confirm() {
    let values = this.form.value;
    values.type = 'book';
    let parsed = this.parse.parse(values);
    parsed.project_id = this.projectId;

    if (this.isNew) {
      this.storage.createSource(parsed);
      if (this.pendingId) {
        this.storage.deletePending(this.pendingId);
      }
    }else {
      this.storage.setSourceFromId(this.previous._id, parsed);
    }

    this.viewCtrl.dismiss();
  }

  // Instant Search
  search() {
    if (this._timeout) {
      clearTimeout(this._timeout);
    }
    this._timeout = setTimeout(() => {
      this.instantStatus.ok = false;
      this.instantStatus.loading = false;
      this.instantStatus.none = false;
      this.instantStatus.err500 = false;
      this.instantStatus.shown = false;
      if (this.form.value.title) {
        this.instantStatus.loading = true;
        let query: string = "";
        let includeAuthors: boolean;
        if (this.form.value.author1lastname || this.form.value.author1firstname) {
          query = this.form.value.title + " " + this.form.value.author1lastname + " " + this.form.value.author1firstname;
          includeAuthors = true;
        }else {
          query = this.form.value.title;
          includeAuthors = false;
        }
        this.fetch.fromName(query, includeAuthors).then(list => {
          if (list.length != 0) {
            this.instantList = list;
            this.instantStatus.loading = false;
            this.instantStatus.ok = true;
          }else {
            this.instantStatus.loading = false;
            this.instantStatus.none = true;
          }
        }, err => {
          if (err >= 500 && err < 599) {
            this.instantStatus.err500 = true;
            this.instantStatus.loading = false;
          }
        });
      }
      this._timeout = null;
    }, 500);
  }

  toggleInstantSearch() {
    this.instantStatus.shown = this.instantStatus.shown ? false : true;
  }

  openExplaining() {
    if (this.instantStatus.none) {
      this.translate.get(["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS", "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS"],
          message: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.OK"]
            }
          ]
        });

        alert.present();
      });
    }else if (this.instantStatus.err500) {
      this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.ERROR"],
          message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.OK"]
            }
          ]
        });

        alert.present();
      });
    }
  }

  fillInfos(suggestion: any) {
    if (this.isEmpty(false)) {
      this.updateValues(suggestion);
      this.instantStatus.shown = false;
      this.insertingFromScan = true;
    }else {
      this.translate.get(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE"],
          message: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_DESC"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.OVERWRITE"],
              handler: () => {
                this.updateValues(suggestion);
                this.instantStatus.shown = false;
                this.insertingFromScan = true;
              }
            },
            {
              text: translations["PROJECT.DETAIL.POPUP.CANCEL"]
            }
          ]
        });

        alert.present();
      });
    }
  }

  // Scan
  scan() {
    if (!this.settings.get("scanBoardingDone")) {
      let modal = this.modalCtrl.create(BoardingScanPage);
      modal.onDidDismiss(() => {
        this.scan();
      });
      modal.present();
    }else {
      BarcodeScanner.scan().then((data) => {
        if (!data.cancelled) {
          if (data.format == "EAN_13") {
            this.fetchFromISBN(data.text);
          }else {
            this.translate.get(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
              let alert = this.alertCtrl.create({
                title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
                message: translations["PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE"],
                buttons: [
                  {
                    text: translations['PROJECT.DETAIL.POPUP.OK']
                  }
                ]
              });
              alert.present();
            });
          }
        }
      }, (err) => {
        this.translate.get(["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN", "PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
          let alert = this.alertCtrl.create({
            title: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN"],
            message: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT"],
            buttons: [
              {
                text: translations['PROJECT.DETAIL.POPUP.OK']
              }
            ]
          });
          alert.present();
        });
      });
    }
  }

  fetchFromISBN(isbn: string) {
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
        if (this.isEmpty(true)) {
          this.updateValues(response);
          this.insertingFromScan = true;
        }else {
          this.translate.get(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe((translations) => {
            let alert = this.alertCtrl.create({
              title: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE"],
              message: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_DESC"],
              buttons: [
                {
                  text: translations["PROJECT.DETAIL.POPUP.OVERWRITE"],
                  handler: () => {
                    this.updateValues(response);
                    this.insertingFromScan = true;
                  }
                },
                {
                  text: translations["PROJECT.DETAIL.POPUP.CANCEL"]
                }
              ]
            });
            alert.present();
          });
        }
      }).catch((response) => {
        loading.dismiss();
        if (response == 404) {
          this.translate.get(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
            let alert = this.alertCtrl.create({
              title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
              message: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT"],
              buttons: [
                {
                  text: translations['PROJECT.DETAIL.POPUP.OK']
                }
              ]
            });
            alert.present();
          });
        }else if (response == 408) {
          this.translate.get(["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE", "PROJECT.DETAIL.POPUP.TIMEOUT_TEXT", "PROJECT.DETAIL.POPUP.ADD", "PROJECT.DETAIL.POPUP.RETRY"]).subscribe((translations) => {
            let alert = this.alertCtrl.create({
              title: translations["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE"],
              message: translations["PROJECT.DETAIL.POPUP.TIMEOUT_TEXT"],
              buttons: [
                {
                  text: translations["PROJECT.DETAIL.POPUP.RETRY"],
                  handler: () => {
                    this.fetchFromISBN(isbn);
                  }
                },
                {
                  text: translations['PROJECT.DETAIL.POPUP.ADD'],
                  handler: () => {
                    this.addPending(isbn);
                  }
                }
              ]
            });
            alert.present();
          });
        }else if (response >= 500 && response <= 599) {
          this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
            let alert = this.alertCtrl.create({
              title: translations["PROJECT.DETAIL.POPUP.ERROR"],
              message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
              buttons: [
                {
                  text: translations['PROJECT.DETAIL.POPUP.OK']
                }
              ]
            });
            alert.present();
          });
        }else {
          this.report.report(response);
        }
      });
    }else {
      this.translate.get(["PROJECT.DETAIL.POPUP.NO_CONNECTION", "PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS", "PROJECT.DETAIL.POPUP.RETRY", "PROJECT.DETAIL.POPUP.ADD"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.NO_CONNECTION"],
          message: translations["PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.RETRY"],
              handler: () => {
                this.fetchFromISBN(isbn);
              }
            },
            {
              text: translations["PROJECT.DETAIL.POPUP.ADD"],
              handler: () => {
                this.currentTransition = alert.dismiss();
                this.addPending(isbn);
                return false;
              }
            }
          ]
        });
        alert.present();
      });
    }
  }

  updateValues(response: any) {
    this.form = this.fb.group(this.mergeObjects(this.form.value, response));
  }

  addPending(isbn: string) {
    var creating = {
      isbn: isbn,
      date: this.language.getMoment()().toObject(),
      project_id: this.projectId
    };

    this.storage.createPending(creating);
    if (this.currentTransition) {
      this.currentTransition.then(() => {
        this.currentTransition = null;
        this.viewCtrl.dismiss();
      })
    }else {
      this.viewCtrl.dismiss();
    }
  }

  isEmpty(includeTitle: boolean) {
    if (!this.form.find('author1firstname').value && !this.form.find('author1lastname').value && !this.form.find('author2firstname').value && !this.form.find('author2lastname').value && !this.form.find('author3firstname').value && !this.form.find('author3lastname').value && !this.form.find('editor').value && !this.form.find('hasAuthors').value && !this.form.find('pageNumber').value && !this.form.find('publicationDate').value && !this.form.find('publicationLocation').value) {
      if (includeTitle) {
        if (!this.form.find('title').value) {
          return true;
        }else {
          return false;
        }
      }else {
        return true;
      }
    }else {
      return false;
    }
  }

  mergeObjects(obj1: any, obj2: any) {
    for (var variable in obj2) {
      if (obj2.hasOwnProperty(variable)) {
        if (obj2[variable] != '') {
          obj1[variable] = [obj2[variable]];
        }else {
          obj1[variable] = [obj1[variable]];
        }
      }
    }
    return obj1;
  }

  browser() {
    SafariViewController.isAvailable().then(avail => {
      if (avail) {
        SafariViewController.show({
          url: this.url 
        });
      }
    });
  }
}
