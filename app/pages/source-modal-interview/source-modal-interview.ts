import {ViewController, NavParams, NavController, AlertController} from 'ionic-angular';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {Component} from '@angular/core';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';

import {AppStorage} from '../../providers/app-storage/app-storage';
import {Parse} from '../../providers/parse/parse';
import {Settings} from '../../providers/settings/settings';
import {Language} from '../../providers/language/language';

@Component({
  templateUrl: 'build/pages/source-modal-interview/source-modal-interview.html'
})
export class SourceModalInterviewPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public firstname: string;
  public lastname: string;
  public hasConfirmed: boolean = false;

  public form: ControlGroup;
  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;
  public civilityOpts: any = {};

  constructor(public viewCtrl: ViewController, public translate: TranslateService, public alertCtrl: AlertController, public params: NavParams, public parse: Parse, public storage: AppStorage, public fb: FormBuilder, public nav: NavController, public language: Language, public settings: Settings) {
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

    this.firstname = this.params.get('firstname');

    this.lastname = this.params.get('lastname');

    if (typeof this.params.get('pendingId') !== "undefined") {
      this.pendingId = this.params.get('pendingId');
    }

    let moment = this.language.getMoment();
    this.form = fb.group({
      author1firstname: [this.noData ? this.settings.get('firstname') : this.previous.author1firstname],
      author1lastname: [this.noData ? this.settings.get('lastname') : this.previous.author1lastname],
      civility: [this.noData ? '' : this.previous.civility],
      interviewed1firstname: [this.noData ? '' : this.previous.interviewed1firstname],
      interviewed1lastname: [this.noData ? '' : this.previous.interviewed1lastname],
      interviewedTitle: [this.noData ? '' : this.previous.interviewedTitle],
      publicationLocation: [this.noData ? '' : this.previous.publicationLocation],
      consultationDate: [this.noData ? moment().utcOffset(0).subtract(-moment().utcOffset(), 'minutes').toISOString() : this.previous.consultationDate],
    });
    this.generateLabels();
    // Use async once issue is resolved
    this.civilityOpts = {
      title: this.translate.instant("PROJECT.PARSE.CIVILITY_TITLE.TITLE")
    };
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
    var values = this.form.value;
    values.type = 'interview';
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

    if ((values.author1firstname && values.author1lastname) && (this.settings.get('firstname') == "" && this.settings.get('lastname') == "")) {
      this.translate.get(["PROJECT.DETAIL.MODAL.INTERVIEW.INTERVIEWER_NAME", "PROJECT.DETAIL.POPUP.SAVE_INTERVIEWER_NAME", "YES", "NO"]).subscribe(translations => {
        let alert = this.alertCtrl.create({
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
        alert.present();
      });
    }else {
      this.viewCtrl.dismiss();
    }
  }
}
