import {ViewController, NavParams, AlertController} from 'ionic-angular';
import {Component} from '@angular/core';
import {TranslateService} from 'ng2-translate/ng2-translate';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';
import {BarcodeScanner, SafariViewController} from 'ionic-native';

import {AppStorage} from '../../providers/app-storage/app-storage.ts';
import {Parse} from '../../providers/parse/parse.ts';
import {Settings} from '../../providers/settings/settings';

@Component({
  templateUrl: 'build/pages/source-modal-cd/source-modal-cd.html'
})
export class SourceModalCdPage {
  public isNew: boolean;
  public noData: boolean;
  public previous: Source;
  public pendingId: string;
  public projectId: string;
  public hasConfirmed: boolean = false;

  public form: ControlGroup;

  constructor(public translate: TranslateService, public viewCtrl: ViewController, public alertCtrl: AlertController, public params: NavParams, public parse: Parse, public storage: AppStorage, public settings: Settings, public fb: FormBuilder) {
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
      author2firstname: [this.noData ? '' : this.previous.author2firstname],
      author2lastname: [this.noData ? '' : this.previous.author2lastname],
      title: [this.noData ? '' : this.previous.title],
      editor: [this.noData ? '' : this.previous.editor],
      publicationLocation: [this.noData ? '' : this.previous.publicationLocation],
      publicationDate: [this.noData ? '' : this.previous.publicationDate]
    });
  }

  ionViewDidEnter() {
    if (!this.settings.get('cdAlertShown')) {
      this.translate.get(["PROJECT.DETAIL.POPUP.OK", "PROJECT.DETAIL.POPUP.USE_CD_FOR_INFORMATION", "PROJECT.DETAIL.POPUP.CAUTION"]).subscribe(translations => {
        let alert = this.alertCtrl.create({
          title: translations["PROJECT.DETAIL.POPUP.CAUTION"],
          message: translations["PROJECT.DETAIL.POPUP.USE_CD_FOR_INFORMATION"],
          buttons: [
            {
              text: translations["PROJECT.DETAIL.POPUP.OK"]
            }
          ]
        });

        alert.present();
        this.settings.set('cdAlertShown', true);
      });
    }
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
    values.type = 'cd';
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
}
