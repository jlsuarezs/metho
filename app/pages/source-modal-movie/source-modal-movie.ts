import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { ViewController, NavParams, ActionSheetController } from 'ionic-angular';
import { TranslateService } from 'ng2-translate/ng2-translate';

import { AppStorage } from '../../providers/app-storage/app-storage';
import { Language } from '../../providers/language/language';
import { Parse } from '../../providers/parse/parse';


@Component({
  templateUrl: 'build/pages/source-modal-movie/source-modal-movie.html'
})
export class SourceModalMoviePage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public hasConfirmed: boolean = false;
  public monthList: string;
  public monthShortList: string;
  public weekdayList: string;
  public weekdayShortList: string;
  public form: FormGroup;

  constructor(public viewCtrl: ViewController, public actionSheetCtrl: ActionSheetController, public params: NavParams, public parse: Parse, public storage: AppStorage, public fb: FormBuilder, public language: Language, public translate: TranslateService) {
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

    if (typeof this.params.get('pendingId') !== "undefined") {
      this.pendingId = this.params.get('pendingId');
    }

    this.form = fb.group({
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
      consultationDate: [this.noData ? '' : this.previous.consultationDate],
    });
    this.generateLabels();
  }

  generateLabels() {
    this.monthList = this.language.getMoment().months().join(",");
    this.monthShortList = this.language.getMoment().monthsShort().join(",");
    this.weekdayList = this.language.getMoment().weekdays().join(",");
    this.weekdayShortList = this.language.getMoment().weekdaysShort().join(",");
  }

  dismiss() {
    if (!this.isEmpty()) {
      this.translate.get(["PROJECT.DETAIL.MODAL.CANCEL", "PROJECT.DETAIL.MODAL.DELETE_DRAFT"]).subscribe(translations => {
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
              text: translations["PROJECT.DETAIL.MODAL.CANCEL"],
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
    var values = this.form.value;
    values.type = 'movie';
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

  isEmpty() {
    if (!this.form.find('hasAuthors').value && !this.form.find('author1firstname').value && !this.form.find('author1lastname').value && !this.form.find('title').value && !this.form.find('episodeTitle').value && !this.form.find('productionLocation').value && !this.form.find('productor').value && !this.form.find('broadcaster').value && !this.form.find('duration').value && !this.form.find('publicationDate').value && !this.form.find('support').value) {
      return true;
    }else {
      return false;
    }
  }
}
