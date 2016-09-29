import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { ViewController, NavParams, AlertController, ActionSheetController } from 'ionic-angular';
import { SafariViewController } from 'ionic-native';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { AppStorage } from '../../providers/app-storage/app-storage';
import { Fetch } from '../../providers/fetch/fetch';
import { Language } from '../../providers/language/language';
import { Parse } from '../../providers/parse/parse';
import { Scan } from '../../providers/scan/scan';
import { Settings } from '../../providers/settings/settings';


@Component({
  templateUrl: 'build/pages/source-modal-book/source-modal-book.html'
})
export class SourceModalBookPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public url: string;
  public pendingId: string;
  public projectId: string;
  public hideScan: boolean;
  public showBrowser: boolean;
  public isAdvanced: boolean;
  public insertingFromScan: boolean;
  public firstname: string;
  public lastname: string;
  public hasConfirmed: boolean = false;

  public form: FormGroup;
  public _timeout: any;
  public instantList: Array<any>;
  public instantStatus: any = {
    loading: false,
    none: false,
    err500: false,
    noConnection: false,
    ok: false,
    shown: false,
    timeout: false
  };

  constructor(
    public viewCtrl: ViewController,
    public params: NavParams,
    public translate: TranslateService,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public storage: AppStorage,
    public fetch: Fetch,
    public language: Language,
    public parse: Parse,
    public scanProvider: Scan,
    public settings: Settings,
    public fb: FormBuilder,
  ) {
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
    if (!this.isEmpty(true) && this.isNew) {
      this.translate.get(["COMMON.CANCEL", "PROJECT.DETAIL.MODAL.DELETE_DRAFT"]).subscribe(translations => {
        let actionsheet = this.actionSheetCtrl.create({
          buttons: [
            {
              text: translations["PROJECT.DETAIL.MODAL.DELETE_DRAFT"],
              role: 'destructive',
              handler: () => {
                actionsheet.dismiss().then(() => {
                  this.viewCtrl.dismiss();
                });
                return false;
              }
            },
            {
              text: translations["COMMON.CANCEL"],
              role: 'cancel'
            }
          ]
        });

        actionsheet.present();
      });
    }else {
      this.viewCtrl.dismiss();
    }
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
      this.instantStatus.timeout = false;
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
          if (err.status >= 500 && err.status < 599) {
            this.instantStatus.err500 = true;
            this.instantStatus.loading = false;
          }else if (err.status == 408) {
            this.instantStatus.err500 = true;
            this.instantStatus.timeout = true;
            this.instantStatus.loading = false;
          }
        });
      }
      this._timeout = null;
    }, 500);
  }

  toggleInstantSearch() {
    this.instantStatus.shown = !this.instantStatus.shown;
  }

  openExplaining() {
    if (this.instantStatus.none) {
      this.translate.get(["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS", "PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC", "COMMON.OK"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS"],
          message: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC"],
          buttons: [
            {
              text: translations["COMMON.OK"]
            }
          ]
        });

        alert.present();
      });
    }else if (this.instantStatus.timeout) {
      this.translate.get(["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE", "PROJECT.DETAIL.POPUP.TIMEOUT_SEARCH", "COMMON.OK"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE"],
          message: translations["PROJECT.DETAIL.POPUP.TIMEOUT_SEARCH"],
          buttons: [
            {
              text: translations["COMMON.OK"]
            }
          ]
        });

        alert.present();
      });
    }else if (this.instantStatus.err500) {
      this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "COMMON.OK"]).subscribe((translations) => {
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
  }

  fillInfos(suggestion: any) {
    if (this.isEmpty(false)) {
      this.updateValues(suggestion);
      this.instantStatus.shown = false;
      this.insertingFromScan = true;
    }else {
      this.translate.get(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "COMMON.CANCEL"]).subscribe((translations) => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE"],
          message: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_DESC"],
          buttons: [
            {
              text: translations["COMMON.CANCEL"]
            },
            {
              text: translations["PROJECT.DETAIL.POPUP.OVERWRITE"],
              handler: () => {
                this.updateValues(suggestion);
                this.instantStatus.shown = false;
                this.insertingFromScan = true;
              }
            }
          ]
        });

        alert.present();
      });
    }
  }

  // Scan
  scan() {
    this.scanProvider.scan().then((response) => {
      if (response.data) {
        if (this.isEmpty(true)) {
          this.updateValues(response.data);
          this.insertingFromScan = true;
        }else {
          response.transition.then(() => {
            this.translate.get(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "COMMON.CANCEL"]).subscribe((translations) => {
              let alert = this.alertCtrl.create({
                title: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE"],
                message: translations["PROJECT.DETAIL.POPUP.AUTO_FILL_DESC"],
                buttons: [
                  {
                    text: translations["COMMON.CANCEL"]
                  },
                  {
                    text: translations["PROJECT.DETAIL.POPUP.OVERWRITE"],
                    handler: () => {
                      this.updateValues(response.data);
                      this.insertingFromScan = true;
                    }
                  }
                ]
              });
              alert.present();
            });
          });
        }
      }else if (response.addPending) {
        this.addPending(response.isbn, response.transition);
      }
    });
  }

  updateValues(response: any) {
    this.form = this.fb.group(this.mergeObjects(this.form.value, response));
  }

  addPending(isbn: string, transition=Promise.resolve()) {
    var creating = {
      isbn: isbn,
      date: this.language.getMoment()().toObject(),
      project_id: this.projectId
    };

    this.storage.createPending(creating);
    transition.then(() => {
      this.viewCtrl.dismiss();
    });
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
