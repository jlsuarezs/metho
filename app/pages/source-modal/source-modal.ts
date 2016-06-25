import {ViewController, NavParams, Modal, NavController, Alert, Loading} from 'ionic-angular';
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

@Component({
  templateUrl: 'build/pages/source-modal/source-modal.html',
  pipes: [TranslatePipe]
})
export class SourceModalPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: any;
  public url: string;
  public pendingId: string;
  public type: string;
  public pId: string;
  public hideScan: boolean;
  public showBrowser: boolean;
  public isAdvanced: boolean;
  public insertingFromScan: boolean;
  public firstname: string;
  public lastname: string;
  public currentTransition: any;
  public hasConfirmed: boolean = false;

  public bookForm: ControlGroup;
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

  public articleForm: ControlGroup;
  public internetForm: ControlGroup;
  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;

  public cdForm: ControlGroup;
  public movieForm: ControlGroup;
  public interviewForm: ControlGroup;
  public civilityOpts: any = {};

  constructor(public viewCtrl: ViewController, public translate: TranslateService, public params: NavParams, public parse: Parse, public storage: AppStorage, public fb: FormBuilder, public nav: NavController, public fetch: Fetch, public settings: Settings, public language: Language) {
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

    this.type = this.params.get('type');

    this.pId = this.params.get('projectId');

    this.firstname = this.params.get('firstname');

    this.lastname = this.params.get('lastname');

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
      // SafariViewController.mayLaunchUrl(this.url);
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
    if (this.type == "book") {
      this.bookForm = fb.group({
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
    }else if (this.type == "article") {
      this.articleForm = fb.group({
        author1firstname: [this.noData ? '' : this.previous.author1firstname],
        author1lastname: [this.noData ? '' : this.previous.author1lastname],
        title: [this.noData ? '' : this.previous.title],
        editor: [this.noData ? '' : this.previous.editor],
        editionNumber: [this.noData ? '' : this.previous.editionNumber],
        publicationDate: [this.noData ? '' : this.previous.publicationDate],
        startPage: [this.noData ? '' : this.previous.startPage],
        endPage: [this.noData ? '' : this.previous.endPage]
      });
    }else if (this.type == "internet") {
      this.internetForm = fb.group({
        hasAuthors: [this.noData ? false : this.previous.hasAuthors],
        author1firstname: [this.noData ? '' : this.previous.author1firstname],
        author1lastname: [this.noData ? '' : this.previous.author1lastname],
        title: [this.noData ? '' : this.previous.title],
        editor: [this.noData ? '' : this.previous.editor],
        url: [this.noData ? '' : this.previous.url],
        consultationDate: [this.noData ? moment().toISOString() : this.previous.consultationDate]
      });
      this.generateLabels();
    }else if (this.type == "cd") {
      this.cdForm = fb.group({
        hasAuthors: [this.noData ? false : this.previous.hasAuthors],
        author1firstname: [this.noData ? '' : this.previous.author1firstname],
        author1lastname: [this.noData ? '' : this.previous.author1lastname],
        author2firstname: [this.noData ? '' : this.previous.author2firstname],
        author2lastname: [this.noData ? '' : this.previous.author2firstname],
        title: [this.noData ? '' : this.previous.title],
        editor: [this.noData ? '' : this.previous.editor],
        publicationLocation: [this.noData ? '' : this.previous.publicationLocation],
        publicationDate: [this.noData ? '' : this.previous.publicationDate]
      });
    }else if (this.type == "movie") {
      this.movieForm = fb.group({
        hasAuthors: [this.noData ? false : this.previous.hasAuthors],
        author1firstname: [this.noData ? '' : this.previous.author1firstname],
        author1lastname: [this.noData ? '' : this.previous.author1lastname],
        title: [this.noData ? '' : this.previous.title],
        episodeTitle: [this.noData ? '' : this.previous.episodeTitle],
        productionLocation: [this.noData ? '' : this.previous.productionLocation],
        productor: [this.noData ? '' : this.previous.productor],
        broadcaster: [this.noData ? '' : this.previous.broadcaster],
        duration: [this.noData ? '' : this.previous.duration],
        publicationDate: [this.noData ? '' : this.previous.publicationDate],
        support: [this.noData ? '' : this.previous.support],
        consultationDate: [this.noData ? moment().toISOString() : this.previous.consultationDate],
      });
      this.generateLabels();
    }else if (this.type == "interview") {
      this.interviewForm = fb.group({
        author1firstname: [this.noData ? this.settings.get('firstname') : this.previous.author1firstname],
        author1lastname: [this.noData ? this.settings.get('lastname') : this.previous.author1lastname],
        civility: [this.noData ? '' : this.previous.civility],
        interviewed1firstname: [this.noData ? '' : this.previous.interviewed1firstname],
        interviewed1lastname: [this.noData ? '' : this.previous.interviewed1lastname],
        interviewedTitle: [this.noData ? '' : this.previous.interviewedTitle],
        publicationLocation: [this.noData ? '' : this.previous.publicationLocation],
        consultationDate: [this.noData ? moment().toISOString() : this.previous.consultationDate],
      });
      this.generateLabels();
      // Use async once issue is resolved
      this.civilityOpts = {
        title: this.translate.instant("PROJECT.PARSE.CIVILITY_TITLE.TITLE")
      };
    }
  }

  generateLabels() {
    this.monthList = this.language.getMoment().months().join(",");
    this.monthShortList = this.language.getMoment().monthsShort().join(",");
    this.weekdayList = this.language.getMoment().weekdays().join(",");
    this.weekdayShortList = this.language.getMoment().weekdaysShort().join(",");
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
    var dismiss = true;
    if (this.type == 'book') {
      var values = this.bookForm.value;
      values.type = 'book';
    }else if (this.type == 'article') {
      var values = this.articleForm.value;
      values.type = 'article';
    }else if (this.type == 'internet') {
      var values = this.internetForm.value;
      values.type = 'internet';
    }else if (this.type == 'cd') {
      var values = this.cdForm.value;
      values.type = 'cd';
    }else if (this.type == 'movie') {
      var values = this.movieForm.value;
      values.type = 'movie';
    }else if (this.type == 'interview') {
      var values = this.interviewForm.value;
      values.type = 'interview';
      if ((values.author1firstname && values.author1lastname) && (this.settings.get('firstname') == "" && this.settings.get('lastname') == "")) {
        dismiss = false;
        this.translate.get(["PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME", "PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME", "YES", "NO"]).subscribe(translations => {
          let alert = Alert.create({
            title: translations["PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME"],
            message: translations["PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME"],
            buttons: [
              {
                text: translations["NO"],
                handler: () => {
                  this.viewCtrl.dismiss();
                }
              },
              {
                text: translations["YES"],
                handler: () => {
                  let transition = alert.dismiss();
                  this.settings.set('firstname', values.author1firstname);
                  this.settings.set('lastname', values.author1lastname);

                  transition.then(() => {
                    this.viewCtrl.dismiss();
                  });
                  return false;
                }
              }
            ]
          });
          this.nav.present(alert);
        });
      }
    }
    let parsed = this.parse.parse(values);
    parsed.project_id = this.pId;
    if (this.isNew) {
      this.storage.createSource(parsed);
      if (this.pendingId) {
        this.storage.deletePending(this.pendingId);
      }
    }else {
      this.storage.setSourceFromId(this.previous._id, parsed);
    }

    if (dismiss) {
      this.viewCtrl.dismiss();
    }
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
      if (this.bookForm.value.title) {
        this.instantStatus.loading = true;
        let query: string = "";
        let includeAuthors: boolean;
        if (this.bookForm.value.author1lastname || this.bookForm.value.author1firstname) {
          query = this.bookForm.value.title + " " + this.bookForm.value.author1lastname + " " + this.bookForm.value.author1firstname;
          includeAuthors = true;
        }else {
          query = this.bookForm.value.title;
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
        let alert = Alert.create({
          title: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS"],
          message: translations["PROJECT.DETAIL.POPUP.NO_SUGGESTIONS_DESC"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.OK"]
            }
          ]
        });

        this.nav.present(alert);
      });
    }else if (this.instantStatus.err500) {
      this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
        let alert = Alert.create({
          title: translations["PROJECT.DETAIL.POPUP.ERROR"],
          message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.OK"]
            }
          ]
        });

        this.nav.present(alert);
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
        let alert = Alert.create({
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
        this.nav.present(alert);
      });
    }
  }

  // Scan
  scan() {
    if (!this.settings.get("scanBoardingDone")) {
      let modal = Modal.create(BoardingScanPage);
      modal.onDismiss(() => {
        this.scan();
      });
      this.nav.present(modal);
    }else {
      BarcodeScanner.scan().then((data) => {
        if (!data.cancelled) {
          if (data.format == "EAN_13") {
            this.fetchFromISBN(data.text);
          }else {
            this.translate.get(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
              let alert = Alert.create({
                title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
                message: translations["PROJECT.DETAIL.POPUP.NOT_RIGHT_BARCODE_TYPE"],
                buttons: [
                  {
                    text: translations['PROJECT.DETAIL.POPUP.OK']
                  }
                ]
              });
              this.nav.present(alert);
            });
          }
        }
      }, (err) => {
        this.translate.get(["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN", "PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
          let alert = Alert.create({
            title: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN"],
            message: translations["PROJECT.DETAIL.POPUP.UNABLE_TO_SCAN_TEXT"],
            buttons: [
              {
                text: translations['PROJECT.DETAIL.POPUP.OK']
              }
            ]
          });
          this.nav.present(alert);
        });
      });
    }
  }

  fetchFromISBN(isbn: string) {
    if (navigator.onLine) {
      let loading = Loading.create();
      this.nav.present(loading);
      this.fetch.fromISBN(isbn).then((response) => {
        loading.dismiss();
        if (this.isEmpty(true)) {
          this.updateValues(response);
          this.insertingFromScan = true;
        }else {
          this.translate.get(["PROJECT.DETAIL.POPUP.AUTO_FILL_TITLE", "PROJECT.DETAIL.POPUP.AUTO_FILL_DESC", "PROJECT.DETAIL.POPUP.OVERWRITE", "PROJECT.DETAIL.POPUP.CANCEL"]).subscribe((translations) => {
            let alert = Alert.create({
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
            this.nav.present(alert);
          });
        }
      }).catch((response) => {
        loading.dismiss();
        if (response == 404) {
          this.translate.get(["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE", "PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
            let alert = Alert.create({
              title: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TITLE"],
              message: translations["PROJECT.DETAIL.POPUP.BOOK_UNAVAILABLE_TEXT"],
              buttons: [
                {
                  text: translations['PROJECT.DETAIL.POPUP.OK']
                }
              ]
            });
            this.nav.present(alert);
          });
        }else if (response == 408) {
          this.translate.get(["PROJECT.DETAIL.POPUP.TIMEOUT_TITLE", "PROJECT.DETAIL.POPUP.TIMEOUT_TEXT", "PROJECT.DETAIL.POPUP.ADD", "PROJECT.DETAIL.POPUP.RETRY"]).subscribe((translations) => {
            let alert = Alert.create({
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
            this.nav.present(alert);
          });
        }else if (response >= 500 && response <= 599) {
          this.translate.get(["PROJECT.DETAIL.POPUP.ERROR", "PROJECT.DETAIL.POPUP.ERROR_500", "PROJECT.DETAIL.POPUP.OK"]).subscribe((translations) => {
            let alert = Alert.create({
              title: translations["PROJECT.DETAIL.POPUP.ERROR"],
              message: translations["PROJECT.DETAIL.POPUP.ERROR_500"],
              buttons: [
                {
                  text: translations['PROJECT.DETAIL.POPUP.OK']
                }
              ]
            });
            this.nav.present(alert);
          });
        }else {
          // ReportUser.report(response);
        }
      });
    }else {
      this.translate.get(["PROJECT.DETAIL.POPUP.NO_CONNECTION", "PROJECT.DETAIL.POPUP.ADD_TO_PENDINGS", "PROJECT.DETAIL.POPUP.RETRY", "PROJECT.DETAIL.POPUP.ADD"]).subscribe((translations) => {
        let alert = Alert.create({
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
        this.nav.present(alert);
      });
    }
  }

  updateValues(response: any) {
    this.bookForm = this.fb.group(this.mergeObjects(this.bookForm.value, response));
  }

  addPending(isbn: string) {
    var creating = {
      isbn: isbn,
      date: this.language.getMoment()().toObject(),
      project_id: this.pId
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
    if (!this.bookForm.find('author1firstname').value && !this.bookForm.find('author1lastname').value && !this.bookForm.find('author2firstname').value && !this.bookForm.find('author2lastname').value && !this.bookForm.find('author3firstname').value && !this.bookForm.find('author3lastname').value && !this.bookForm.find('editor').value && !this.bookForm.find('hasAuthors').value && !this.bookForm.find('pageNumber').value && !this.bookForm.find('publicationDate').value && !this.bookForm.find('publicationLocation').value) {
      if (includeTitle) {
        if (!this.bookForm.find('title').value) {
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
    // SafariViewController.isAvailable().then(avail => {
    //   if (avail) {
    //     SafariViewController.show({
    //       url: this.url
    //     });
    //   }
    // });
  }
}
