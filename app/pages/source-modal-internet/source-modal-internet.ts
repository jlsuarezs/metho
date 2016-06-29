import {ViewController, NavParams, Modal, NavController, Alert, Loading} from 'ionic-angular';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {Component} from '@angular/core';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';

import {AppStorage} from '../../providers/app-storage/app-storage.ts';
import {Parse} from '../../providers/parse/parse.ts';
import {Settings} from '../../providers/settings/settings';
import {Language} from '../../providers/language/language';

@Component({
  templateUrl: 'build/pages/source-modal-internet/source-modal-internet.html',
  pipes: [TranslatePipe]
})
export class SourceModalInternetPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: any;
  public pendingId: string;
  public pId: string;
  public isAdvanced: boolean;
  public currentTransition: any;
  public hasConfirmed: boolean = false;

  public form: ControlGroup;
  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;

  constructor(public viewCtrl: ViewController, public translate: TranslateService, public params: NavParams, public parse: Parse, public storage: AppStorage, public fb: FormBuilder, public settings: Settings, public language: Language) {
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

    this.pId = this.params.get('projectId');

    if (typeof this.params.get('pendingId') !== "undefined") {
      this.pendingId = this.params.get('pendingId');
    }

    this.isAdvanced = this.settings.get("advanced");

    let moment = this.language.getMoment();
    this.form = fb.group({
      hasAuthors: [this.noData ? false : this.previous.hasAuthors],
      author1firstname: [this.noData ? '' : this.previous.author1firstname],
      author1lastname: [this.noData ? '' : this.previous.author1lastname],
      title: [this.noData ? '' : this.previous.title],
      editor: [this.noData ? '' : this.previous.editor],
      url: [this.noData ? '' : this.previous.url],
      consultationDate: [this.noData ? moment().toISOString() : this.previous.consultationDate]
    });
    this.generateLabels();
  }

  ionViewDidEnter() {
    console.log(Date.now());
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
    let values = this.form.value;
    values.type = 'internet';
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
  }

  updateValues(response: any) {
    this.form = this.fb.group(this.mergeObjects(this.form.value, response));
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
}
